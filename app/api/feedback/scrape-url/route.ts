import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { analyzeURLReviewsAI } from '@/lib/ai';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized. Please log in to analyze review URLs.' }, { status: 401 });
  }

  const sessionUser = session.user as { workspaceId?: string; role?: string };
  const workspaceId = sessionUser.workspaceId || 'cmu001ws0000001';

  try {
    const { url, importToInbox } = await req.json();

    if (!url || typeof url !== 'string' || !url.trim().startsWith('http')) {
      return NextResponse.json({ error: 'Please enter a valid HTTP/HTTPS review URL.' }, { status: 400 });
    }

    const cleanUrl = url.trim();
    let webpageText = '';

    // Fetch webpage content
    try {
      const response = await fetch(cleanUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        next: { revalidate: 3600 },
      });

      if (response.ok) {
        const html = await response.text();
        // Basic HTML text extraction
        webpageText = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
    } catch (e) {
      console.warn('Direct fetch failed, fallback intelligence active:', e);
    }

    // Run AI Analysis on extracted review webpage content
    const analysis = await analyzeURLReviewsAI(cleanUrl, webpageText);

    // If user requested to import extracted reviews directly into workspace inbox
    if (importToInbox && analysis.extractedReviews.length > 0) {
      // Guard workspace exists
      await prisma.workspace.upsert({
        where: { id: workspaceId },
        update: {},
        create: { id: workspaceId, name: 'Acme SaaS Corp' },
      });

      for (const item of analysis.extractedReviews) {
        const created = await prisma.feedback.create({
          data: {
            content: `[Online Review - Rating ${item.rating}★] ${item.content}`,
            channel: 'app_store',
            sourceRef: `${analysis.businessName} (${cleanUrl.slice(0, 30)}...)`,
            customerLabel: `${item.author} (${analysis.businessCategory})`,
            sentiment: item.sentiment,
            sentimentScore: item.sentimentScore,
            workspaceId,
          },
        });

        // Link themes
        if (item.themes && item.themes.length > 0) {
          for (const tName of item.themes) {
            let themeRecord = await prisma.theme.findFirst({
              where: { workspaceId, name: { equals: tName, mode: 'insensitive' } },
            });

            if (!themeRecord) {
              try {
                themeRecord = await prisma.theme.create({
                  data: {
                    name: tName,
                    description: `AI extracted category for ${analysis.businessName}`,
                    color: '#06b6d4',
                    workspaceId,
                  },
                });
              } catch (te) {
                // Ignore duplicates
              }
            }

            if (themeRecord) {
              try {
                await prisma.feedbackTheme.create({
                  data: {
                    feedbackId: created.id,
                    themeId: themeRecord.id,
                    confidence: 0.95,
                  },
                });
              } catch (fte) {
                // Ignore duplicate links
              }
            }
          }
        }
      }
    }

    return NextResponse.json(analysis);
  } catch (e) {
    console.error('URL Review Analysis API Error:', e);
    return NextResponse.json({ error: 'Failed to analyze review URL. Please verify the URL and try again.' }, { status: 500 });
  }
}
