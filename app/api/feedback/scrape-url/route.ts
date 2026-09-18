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
    const { url, rawTextContent, customBusinessName, importToInbox } = await req.json();

    let targetUrl = (url || '').trim();
    let webpagePayload = (rawTextContent || '').trim();
    let extractedMetaTitle = '';

    // If user provided a URL, fetch live real webpage content
    if (targetUrl.startsWith('http')) {
      try {
        // Expand shortlinks (e.g. maps.app.goo.gl or bit.ly)
        let resolvedUrl = targetUrl;
        const headRes = await fetch(targetUrl, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        });

        if (headRes.url) {
          resolvedUrl = headRes.url;
        }

        const html = await headRes.text();

        // Extract Organization Meta Title or Site Name
        const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
        const ogTitleMatch = html.match(/<meta[^>]*property=["']og:(?:title|site_name)["'][^>]*content=["'](.*?)["']/i);
        if (ogTitleMatch && ogTitleMatch[1]) {
          extractedMetaTitle = ogTitleMatch[1].trim();
        } else if (titleMatch && titleMatch[1]) {
          extractedMetaTitle = titleMatch[1].replace(/[-|_|:|\bReviews\b].*/i, '').trim();
        }

        // Extract JSON-LD, script blocks, and clean text
        const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi) || [];
        const jsonLdContent = jsonLdMatches.map((m) => m.replace(/<[^>]+>/g, '')).join('\n');

        // Extract clean text content
        const cleanText = html
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        webpagePayload = (jsonLdContent + '\n' + cleanText).slice(0, 20000);
      } catch (e) {
        console.warn('Live fetch note for URL:', targetUrl, e);
      }
    }

    if (!webpagePayload && !targetUrl) {
      return NextResponse.json({ error: 'Please enter a valid review URL or paste review text.' }, { status: 400 });
    }

    // Execute Gemini AI Real Review Analysis
    const analysis = await analyzeURLReviewsAI(targetUrl || 'Google Reviews', webpagePayload);

    // Override or refine Organization / Business Name
    if (customBusinessName && typeof customBusinessName === 'string' && customBusinessName.trim().length > 0) {
      analysis.businessName = customBusinessName.trim();
    } else if (extractedMetaTitle && (analysis.businessName.includes('Google') || analysis.businessName.includes('Reviews'))) {
      analysis.businessName = extractedMetaTitle;
    }

    // If user requested to import extracted real recent reviews directly into workspace inbox
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
            content: `[${analysis.businessName} Online Review - ${item.rating}★] ${item.content}`,
            channel: 'app_store',
            sourceRef: `Online Reviews: ${analysis.businessName}`,
            customerLabel: `${item.author} (${analysis.businessName})`,
            sentiment: item.sentiment,
            sentimentScore: item.sentimentScore,
            workspaceId,
          },
        });

        // Link extracted theme categories automatically
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
    return NextResponse.json({ error: 'Failed to analyze review content. Please verify the URL/text and try again.' }, { status: 500 });
  }
}
