import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = (session.user as any).workspaceId;

  // Fetch feedback items in workspace
  const feedbacks = await prisma.feedback.findMany({
    where: { workspaceId },
    include: { themes: true },
  });

  const themes = await prisma.theme.findMany({
    where: { workspaceId },
  });

  let analyzedCount = 0;

  for (const item of feedbacks) {
    const text = item.content.toLowerCase();

    // Sentiment Heuristic Computation
    let sentiment: 'POS' | 'NEU' | 'NEG' = 'NEU';
    let sentimentScore = 0.5;

    const posKeywords = ['love', 'great', 'fast', 'crisp', 'saved', 'improved', 'seamless', 'awesome', 'excellent', 'useful', 'happy', 'helped'];
    const negKeywords = ['slow', 'bug', 'failed', 'confusing', 'incorrect', 'issue', 'problem', 'delay', 'took', 'broken', 'error', 'hate', 'bad'];

    let posMatch = 0;
    let negMatch = 0;

    posKeywords.forEach((kw) => { if (text.includes(kw)) posMatch++; });
    negKeywords.forEach((kw) => { if (text.includes(kw)) negMatch++; });

    if (posMatch > negMatch) {
      sentiment = 'POS';
      sentimentScore = Math.min(0.98, 0.7 + posMatch * 0.1);
    } else if (negMatch > posMatch) {
      sentiment = 'NEG';
      sentimentScore = Math.max(0.05, 0.3 - negMatch * 0.1);
    }

    // Auto theme matching
    let matchedThemeId: string | null = null;

    if (text.includes('load') || text.includes('speed') || text.includes('performance') || text.includes('fast') || text.includes('slow')) {
      matchedThemeId = themes.find((t) => t.name.toLowerCase().includes('performance'))?.id || null;
    } else if (text.includes('ui') || text.includes('ux') || text.includes('layout') || text.includes('mobile') || text.includes('menu') || text.includes('design')) {
      matchedThemeId = themes.find((t) => t.name.toLowerCase().includes('ui'))?.id || null;
    } else if (text.includes('bill') || text.includes('tax') || text.includes('price') || text.includes('invoice') || text.includes('payment')) {
      matchedThemeId = themes.find((t) => t.name.toLowerCase().includes('billing'))?.id || null;
    } else if (text.includes('slack') || text.includes('zapier') || text.includes('webhook') || text.includes('integration') || text.includes('api')) {
      matchedThemeId = themes.find((t) => t.name.toLowerCase().includes('integration'))?.id || null;
    } else if (text.includes('pdf') || text.includes('export') || text.includes('sso') || text.includes('request') || text.includes('feature')) {
      matchedThemeId = themes.find((t) => t.name.toLowerCase().includes('feature'))?.id || null;
    }

    // Update feedback item
    await prisma.feedback.update({
      where: { id: item.id },
      data: {
        sentiment,
        sentimentScore,
      },
    });

    if (matchedThemeId && !item.themes.some((t) => t.themeId === matchedThemeId)) {
      await prisma.feedbackTheme.create({
        data: {
          feedbackId: item.id,
          themeId: matchedThemeId,
          confidence: 0.9,
        },
      });
    }

    analyzedCount++;
  }

  return NextResponse.json({
    message: `Successfully analyzed ${analyzedCount} feedback items.`,
    analyzedCount,
  });
}
