import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

const POSITIVE_LEXICON: Record<string, { weight: number; intensity: number }> = {
  love: { weight: 1.0, intensity: 0.9 },
  great: { weight: 0.8, intensity: 0.7 },
  fast: { weight: 0.7, intensity: 0.6 },
  crisp: { weight: 0.6, intensity: 0.5 },
  saved: { weight: 0.8, intensity: 0.7 },
  improved: { weight: 0.7, intensity: 0.6 },
  seamless: { weight: 0.9, intensity: 0.8 },
  awesome: { weight: 0.9, intensity: 0.8 },
  excellent: { weight: 1.0, intensity: 0.9 },
  useful: { weight: 0.7, intensity: 0.6 },
  happy: { weight: 0.8, intensity: 0.7 },
  helped: { weight: 0.7, intensity: 0.6 },
  perfect: { weight: 1.0, intensity: 0.9 },
  amazing: { weight: 0.9, intensity: 0.8 },
  fantastic: { weight: 0.9, intensity: 0.8 },
  wonderful: { weight: 0.9, intensity: 0.8 },
  outstanding: { weight: 1.0, intensity: 0.9 },
  brilliant: { weight: 0.9, intensity: 0.8 },
  superb: { weight: 0.9, intensity: 0.8 },
  efficient: { weight: 0.8, intensity: 0.7 },
  smooth: { weight: 0.7, intensity: 0.6 },
  intuitive: { weight: 0.8, intensity: 0.7 },
  reliable: { weight: 0.8, intensity: 0.7 },
  responsive: { weight: 0.7, intensity: 0.6 },
  clean: { weight: 0.6, intensity: 0.5 },
  delightful: { weight: 0.9, intensity: 0.8 },
  powerful: { weight: 0.7, intensity: 0.6 },
  simple: { weight: 0.6, intensity: 0.5 },
  elegant: { weight: 0.7, intensity: 0.6 },
  robust: { weight: 0.7, intensity: 0.6 },
};

const NEGATIVE_LEXICON: Record<string, { weight: number; intensity: number }> = {
  slow: { weight: 0.8, intensity: 0.7 },
  bug: { weight: 0.9, intensity: 0.8 },
  failed: { weight: 0.9, intensity: 0.8 },
  confusing: { weight: 0.7, intensity: 0.6 },
  incorrect: { weight: 0.7, intensity: 0.6 },
  issue: { weight: 0.6, intensity: 0.5 },
  problem: { weight: 0.7, intensity: 0.6 },
  delay: { weight: 0.7, intensity: 0.6 },
  took: { weight: 0.4, intensity: 0.3 },
  broken: { weight: 0.9, intensity: 0.8 },
  error: { weight: 0.8, intensity: 0.7 },
  hate: { weight: 1.0, intensity: 0.9 },
  bad: { weight: 0.7, intensity: 0.6 },
  terrible: { weight: 1.0, intensity: 0.9 },
  awful: { weight: 0.9, intensity: 0.8 },
  horrible: { weight: 1.0, intensity: 0.9 },
  frustrating: { weight: 0.8, intensity: 0.7 },
  annoying: { weight: 0.7, intensity: 0.6 },
  disappointing: { weight: 0.8, intensity: 0.7 },
  unreliable: { weight: 0.8, intensity: 0.7 },
  crash: { weight: 0.9, intensity: 0.8 },
  freeze: { weight: 0.8, intensity: 0.7 },
  laggy: { weight: 0.7, intensity: 0.6 },
  missing: { weight: 0.6, intensity: 0.5 },
  lack: { weight: 0.5, intensity: 0.4 },
  difficult: { weight: 0.6, intensity: 0.5 },
  complex: { weight: 0.5, intensity: 0.4 },
  unintuitive: { weight: 0.7, intensity: 0.6 },
  clunky: { weight: 0.7, intensity: 0.6 },
  outdated: { weight: 0.5, intensity: 0.4 },
  limited: { weight: 0.5, intensity: 0.4 },
};

const THEME_KEYWORDS: Record<string, string[]> = {
  'Performance & Speed': ['load', 'speed', 'performance', 'fast', 'slow', 'lag', 'timeout', 'crash', 'freeze', 'responsive', 'latency'],
  'UI/UX Usability': ['ui', 'ux', 'layout', 'mobile', 'menu', 'design', 'interface', 'navigation', 'dropdown', 'button', 'screen', 'dark mode', 'responsive'],
  'Billing & Subscriptions': ['bill', 'tax', 'price', 'invoice', 'payment', 'subscription', 'charge', 'refund', 'cost', 'pricing', 'billing', 'plan'],
  'Integrations & Webhooks': ['slack', 'zapier', 'webhook', 'integration', 'api', 'connect', 'sync', 'automate', 'workflow', 'trigger'],
  'Feature Requests': ['pdf', 'export', 'sso', 'request', 'feature', 'add', 'need', 'want', 'missing', 'support', 'import', 'analytics', 'report'],
  'Support Experience': ['support', 'ticket', 'reply', 'response', 'wait', 'delay', 'help', 'assist', 'ignore', 'unresponsive', 'agent', 'team'],
};

function computeSentiment(text: string): { sentiment: 'POS' | 'NEU' | 'NEG'; score: number; confidence: number } {
  const words = text.toLowerCase().split(/\W+/);
  let posScore = 0;
  let negScore = 0;
  let posIntensity = 0;
  let negIntensity = 0;
  let matchedCount = 0;

  for (const word of words) {
    if (POSITIVE_LEXICON[word]) {
      posScore += POSITIVE_LEXICON[word].weight;
      posIntensity += POSITIVE_LEXICON[word].intensity;
      matchedCount++;
    }
    if (NEGATIVE_LEXICON[word]) {
      negScore += NEGATIVE_LEXICON[word].weight;
      negIntensity += NEGATIVE_LEXICON[word].intensity;
      matchedCount++;
    }
  }

  const totalScore = posScore + negScore;
  if (totalScore === 0) {
    return { sentiment: 'NEU', score: 0.5, confidence: 0.3 };
  }

  const netScore = (posScore - negScore) / totalScore;
  const avgIntensity = (posIntensity + negIntensity) / Math.max(matchedCount, 1);
  const confidence = Math.min(0.95, 0.4 + avgIntensity * 0.5);

  if (netScore > 0.15) {
    return { sentiment: 'POS', score: Math.min(0.98, 0.6 + netScore * 0.4), confidence };
  } else if (netScore < -0.15) {
    return { sentiment: 'NEG', score: Math.max(0.02, 0.4 + netScore * 0.4), confidence };
  }
  return { sentiment: 'NEU', score: 0.5, confidence: Math.max(0.3, confidence * 0.5) };
}

function assignThemes(text: string, themes: Array<{ id: string; name: string }>): Array<{ themeId: string; confidence: number }> {
  const matches: Array<{ themeId: string; confidence: number }> = [];
  const lowerText = text.toLowerCase();

  for (const theme of themes) {
    const keywords = THEME_KEYWORDS[theme.name] || [];
    let matchCount = 0;
    for (const kw of keywords) {
      if (lowerText.includes(kw.toLowerCase())) {
        matchCount++;
      }
    }
    if (matchCount > 0) {
      const confidence = Math.min(0.95, 0.6 + matchCount * 0.1);
      matches.push({ themeId: theme.id, confidence });
    }
  }

  return matches;
}

function extractKeywords(text: string): { positive: string[]; negative: string[] } {
  const words = text.toLowerCase().split(/\W+/);
  const positive: string[] = [];
  const negative: string[] = [];

  for (const word of words) {
    if (POSITIVE_LEXICON[word]) positive.push(word);
    if (NEGATIVE_LEXICON[word]) negative.push(word);
  }

  return { positive, negative };
}

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = (session.user as { workspaceId?: string }).workspaceId;

  const feedbacks = await prisma.feedback.findMany({
    where: { workspaceId },
    include: { themes: true },
  });

  const themes = await prisma.theme.findMany({
    where: { workspaceId },
  });

  let analyzedCount = 0;
  const keywordFrequency: Record<string, { positive: number; negative: number }> = {};

  for (const item of feedbacks) {
    const { sentiment, score } = computeSentiment(item.content);
    const themeMatches = assignThemes(item.content, themes);
    const { positive, negative } = extractKeywords(item.content);

    for (const kw of positive) {
      keywordFrequency[kw] = keywordFrequency[kw] || { positive: 0, negative: 0 };
      keywordFrequency[kw].positive++;
    }
    for (const kw of negative) {
      keywordFrequency[kw] = keywordFrequency[kw] || { positive: 0, negative: 0 };
      keywordFrequency[kw].negative++;
    }

    await prisma.feedback.update({
      where: { id: item.id },
      data: {
        sentiment,
        sentimentScore: score,
      },
    });

    const existingThemeIds = new Set(item.themes.map((t) => t.themeId));
    for (const match of themeMatches) {
      if (!existingThemeIds.has(match.themeId)) {
        await prisma.feedbackTheme.create({
          data: {
            feedbackId: item.id,
            themeId: match.themeId,
            confidence: match.confidence,
          },
        });
      }
    }

    analyzedCount++;
  }

  const topPositive = Object.entries(keywordFrequency)
    .filter(([, v]) => v.positive > v.negative)
    .sort(([, a], [, b]) => b.positive - a.positive)
    .slice(0, 10)
    .map(([kw, v]) => ({ keyword: kw, frequency: v.positive }));

  const topNegative = Object.entries(keywordFrequency)
    .filter(([, v]) => v.negative > v.positive)
    .sort(([, a], [, b]) => b.negative - a.negative)
    .slice(0, 10)
    .map(([kw, v]) => ({ keyword: kw, frequency: v.negative }));

  return NextResponse.json({
    message: `Successfully analyzed ${analyzedCount} feedback items.`,
    analyzedCount,
    topPositiveKeywords: topPositive,
    topNegativeKeywords: topNegative,
  });
}