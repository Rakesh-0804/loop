import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { analyzeFeedbackAI } from '@/lib/ai';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = (session.user as any).workspaceId || 'cmu001ws0000001';

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }

    const singleFeedbackId = body?.feedbackId;

    // Fetch themes in workspace
    const themes = await prisma.theme.findMany({
      where: { workspaceId },
    });
    const themeNames = themes.map((t) => t.name);

    if (singleFeedbackId) {
      // Analyze single feedback item
      const item = await prisma.feedback.findFirst({
        where: { id: singleFeedbackId, workspaceId },
        include: { themes: { include: { theme: true } } },
      });

      if (!item) {
        return NextResponse.json({ error: 'Feedback item not found' }, { status: 404 });
      }

      const aiResult = await analyzeFeedbackAI(item.content, themeNames);

      // Update feedback record
      await prisma.feedback.update({
        where: { id: item.id },
        data: {
          sentiment: aiResult.sentiment,
          sentimentScore: aiResult.sentimentScore,
        },
      });

      // Link matched themes
      for (const matchedThemeName of aiResult.themes) {
        let matchedTheme = themes.find((t) => t.name.toLowerCase() === matchedThemeName.toLowerCase());
        if (!matchedTheme) {
          try {
            matchedTheme = await prisma.theme.create({
              data: {
                name: matchedThemeName,
                description: `Auto-extracted theme category for ${matchedThemeName}`,
                color: '#6366f1',
                workspaceId,
              },
            });
            themes.push(matchedTheme);
          } catch (te) {
            console.error('Theme creation note:', te);
          }
        }

        if (matchedTheme && !item.themes.some((t) => t.themeId === matchedTheme.id)) {
          try {
            await prisma.feedbackTheme.create({
              data: {
                feedbackId: item.id,
                themeId: matchedTheme.id,
                confidence: aiResult.sentimentScore,
              },
            });
          } catch (fte) {
            // ignore duplicate
          }
        }
      }

      const updatedItem = await prisma.feedback.findUnique({
        where: { id: item.id },
        include: { themes: { include: { theme: true } } },
      });

      const sentimentLabel =
        aiResult.sentiment === 'POS' ? 'Positive 🟢' : aiResult.sentiment === 'NEG' ? 'Negative 🔴' : 'Neutral 🟡';
      const scorePct = Math.round(aiResult.sentimentScore * 100);

      const explanation = `Gemini 3.6 Flash AI classified this feedback as ${sentimentLabel} (${scorePct}% satisfaction score). Matched theme categories: ${
        aiResult.themes.length > 0 ? aiResult.themes.join(', ') : 'General Usability'
      }.`;

      return NextResponse.json({
        message: 'Feedback re-analyzed successfully',
        feedback: updatedItem,
        aiResult,
        explanation,
      });
    }

    // Auto-classify all inbox items
    const feedbacks = await prisma.feedback.findMany({
      where: { workspaceId },
      include: { themes: true },
    });

    let analyzedCount = 0;
    for (const item of feedbacks) {
      const aiResult = await analyzeFeedbackAI(item.content, themeNames);

      await prisma.feedback.update({
        where: { id: item.id },
        data: {
          sentiment: aiResult.sentiment,
          sentimentScore: aiResult.sentimentScore,
        },
      });

      for (const matchedThemeName of aiResult.themes) {
        const matchedTheme = themes.find((t) => t.name.toLowerCase() === matchedThemeName.toLowerCase());
        if (matchedTheme && !item.themes.some((t) => t.themeId === matchedTheme.id)) {
          try {
            await prisma.feedbackTheme.create({
              data: {
                feedbackId: item.id,
                themeId: matchedTheme.id,
                confidence: aiResult.sentimentScore,
              },
            });
          } catch (fte) {
            // ignore duplicate
          }
        }
      }
      analyzedCount++;
    }

    return NextResponse.json({
      message: `Successfully analyzed ${analyzedCount} feedback items using Gemini 3.6 Flash AI Engine.`,
      analyzedCount,
    });
  } catch (e) {
    console.error('API Feedback Analyze Error:', e);
    return NextResponse.json({ error: 'Failed to analyze feedback item' }, { status: 500 });
  }
}