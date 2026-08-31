import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { analyzeFeedbackAI } from '@/lib/ai';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Please log in to upload CSV feedback.' }, { status: 401 });
  }

  const sessionUser = session.user as { workspaceId?: string; role?: string };
  const role = sessionUser.role || 'ADMIN';
  if (role === 'VIEWER') {
    return NextResponse.json({ error: 'Viewer account has read-only access. Please log in as Admin or Analyst to upload CSV.' }, { status: 403 });
  }

  const workspaceId = sessionUser.workspaceId || 'cmu001ws0000001';

  try {
    const body = await req.json();
    const items = body.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Please provide a non-empty items array in CSV' }, { status: 400 });
    }

    // 1. Ensure Workspace exists
    await prisma.workspace.upsert({
      where: { id: workspaceId },
      update: {},
      create: {
        id: workspaceId,
        name: 'Acme SaaS Corp',
      },
    });

    // 2. Fetch existing workspace themes for AI categorization
    const dbThemes = await prisma.theme.findMany({ where: { workspaceId } });
    const themeNames = dbThemes.map((t) => t.name);

    let positivesCount = 0;
    let negativesCount = 0;
    let neutralsCount = 0;
    const createdRecords = [];

    for (const rawItem of items) {
      const content = (rawItem.content || rawItem.feedback || '').trim();
      if (!content) continue;

      const rawChannel = (rawItem.channel || 'support_ticket').toLowerCase();
      let channel = 'support_ticket';
      if (rawChannel.includes('app') || rawChannel.includes('store')) channel = 'app_store';
      else if (rawChannel.includes('nps') || rawChannel.includes('survey')) channel = 'nps_survey';
      else if (rawChannel.includes('sales') || rawChannel.includes('call')) channel = 'sales_call';
      else if (rawChannel.includes('community') || rawChannel.includes('post') || rawChannel.includes('slack')) channel = 'community_post';

      const customerLabel = rawItem.customerLabel || rawItem.customer || rawItem.user || null;
      const sourceRef = rawItem.sourceRef || rawItem.source || rawItem.reference || 'CSV Bulk Upload';

      // Real Gemini 3.6 Flash AI sentiment & theme analysis
      const aiResult = await analyzeFeedbackAI(content, themeNames);
      const sentiment = aiResult.sentiment;
      const sentimentScore = aiResult.sentimentScore;

      if (sentiment === 'POS') positivesCount++;
      else if (sentiment === 'NEG') negativesCount++;
      else neutralsCount++;

      const feedbackRecord = await prisma.feedback.create({
        data: {
          content,
          channel,
          customerLabel,
          sourceRef,
          sentiment,
          sentimentScore,
          status: 'NEW',
          workspaceId,
        },
      });

      // Link matched theme clusters
      if (aiResult.themes && aiResult.themes.length > 0) {
        for (const tName of aiResult.themes) {
          let matchedTheme = dbThemes.find((t) => t.name.toLowerCase() === tName.toLowerCase());
          if (!matchedTheme) {
            try {
              matchedTheme = await prisma.theme.create({
                data: {
                  name: tName,
                  description: `AI auto-generated theme category for ${tName}`,
                  color: '#6366f1',
                  workspaceId,
                },
              });
              dbThemes.push(matchedTheme);
            } catch (te) {
              console.error('Theme creation note:', te);
            }
          }

          if (matchedTheme) {
            try {
              await prisma.feedbackTheme.create({
                data: {
                  feedbackId: feedbackRecord.id,
                  themeId: matchedTheme.id,
                  confidence: 0.95,
                },
              });
            } catch (fte) {
              // Duplicate link ignored
            }
          }
        }
      }

      createdRecords.push(feedbackRecord);
    }

    return NextResponse.json({
      message: 'Bulk CSV feedback processing complete',
      totalProcessed: createdRecords.length,
      positivesCount,
      negativesCount,
      neutralsCount,
      summary: `Successfully imported and AI-analyzed ${createdRecords.length} feedback items: ${positivesCount} Positive, ${negativesCount} Negative, ${neutralsCount} Neutral.`,
    });
  } catch (e) {
    console.error('Bulk upload error:', e);
    return NextResponse.json({ error: 'Failed to process bulk CSV feedbacks' }, { status: 500 });
  }
}
