import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DEMO_FEEDBACKS } from '@/lib/demo-data';

type AnalysisFeedback = {
  id: string;
  content: string;
  channel: string;
  sentiment: 'POS' | 'NEU' | 'NEG' | null;
  createdAt: Date;
  themes: { theme: { name: string } }[];
};

type AnalysisInput = Omit<AnalysisFeedback, 'createdAt'> & { createdAt: Date | string };

function toAnalysisInput(f: AnalysisInput): AnalysisFeedback {
  return { ...f, createdAt: new Date(f.createdAt) };
}

const POS_KEYWORDS = [
  'love', 'great', 'fast', 'crisp', 'saved', 'improved', 'seamless', 'awesome', 'excellent',
  'useful', 'happy', 'helped', 'perfect', 'amazing', 'fantastic', 'wonderful', 'outstanding',
  'brilliant', 'superb', 'efficient', 'smooth', 'intuitive', 'reliable', 'responsive', 'clean'
];

const NEG_KEYWORDS = [
  'slow', 'bug', 'failed', 'confusing', 'incorrect', 'issue', 'problem', 'delay', 'took',
  'broken', 'error', 'hate', 'bad', 'terrible', 'awful', 'horrible', 'frustrating', 'annoying',
  'disappointing', 'unreliable', 'crash', 'freeze', 'laggy', 'broken', 'missing', 'lack'
];

const BILLING_KEYWORDS = ['billing', 'invoice', 'tax', 'payment', 'charge', 'refund', 'subscription', 'price', 'cost', 'bill'];
const PERFORMANCE_KEYWORDS = ['slow', 'lag', 'performance', 'speed', 'load', 'timeout', 'crash', 'freeze', 'bug', 'error'];
const SUPPORT_KEYWORDS = ['support', 'ticket', 'reply', 'response', 'wait', 'delay', 'help', 'assist', 'ignore', 'unresponsive'];

function computeAnalysis(feedbacks: AnalysisFeedback[], timeframe: string, channel: string) {
  const total = feedbacks.length;
  if (total === 0) {
    return {
      netSentimentIndex: 0,
      csat: 0,
      sentimentDistribution: { POS: 0, NEU: 0, NEG: 0 },
      sentimentByChannel: {},
      sentimentByTheme: {},
      keywordDrivers: { positive: [], negative: [] },
      riskFlags: [],
      totalAnalyzed: 0,
      timeframe,
      channel,
    };
  }

  const posCount = feedbacks.filter((f) => f.sentiment === 'POS').length;
  const neuCount = feedbacks.filter((f) => f.sentiment === 'NEU').length;
  const negCount = feedbacks.filter((f) => f.sentiment === 'NEG').length;

  const posRatio = posCount / total;
  const negRatio = negCount / total;
  const netSentimentIndex = Math.round((posRatio - negRatio) * 100);
  const csat = Math.round(posRatio * 100);

  const sentimentDistribution = { POS: posCount, NEU: neuCount, NEG: negCount };

  const sentimentByChannel: Record<string, { POS: number; NEU: number; NEG: number }> = {};
  const sentimentByTheme: Record<string, { POS: number; NEU: number; NEG: number }> = {};

  const posKeywordsMap: Record<string, number> = {};
  const negKeywordsMap: Record<string, number> = {};

  const riskFlags: Array<{
    type: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    count: number;
    description: string;
    channel: string;
  }> = [];

  let billingNegCount = 0;
  let performanceNegCount = 0;
  let supportNegCount = 0;

  for (const fb of feedbacks) {
    const ch = fb.channel;
    if (!sentimentByChannel[ch]) {
      sentimentByChannel[ch] = { POS: 0, NEU: 0, NEG: 0 };
    }
    if (fb.sentiment) {
      sentimentByChannel[ch][fb.sentiment]++;
    }

    for (const ft of fb.themes) {
      const themeName = ft.theme.name;
      if (!sentimentByTheme[themeName]) {
        sentimentByTheme[themeName] = { POS: 0, NEU: 0, NEG: 0 };
      }
      if (fb.sentiment) {
        sentimentByTheme[themeName][fb.sentiment]++;
      }
    }

    const text = fb.content.toLowerCase();

    for (const kw of POS_KEYWORDS) {
      if (text.includes(kw)) {
        posKeywordsMap[kw] = (posKeywordsMap[kw] || 0) + 1;
      }
    }
    for (const kw of NEG_KEYWORDS) {
      if (text.includes(kw)) {
        negKeywordsMap[kw] = (negKeywordsMap[kw] || 0) + 1;
      }
    }

    if (fb.sentiment === 'NEG') {
      for (const kw of BILLING_KEYWORDS) {
        if (text.includes(kw)) {
          billingNegCount++;
          break;
        }
      }
      for (const kw of PERFORMANCE_KEYWORDS) {
        if (text.includes(kw)) {
          performanceNegCount++;
          break;
        }
      }
      for (const kw of SUPPORT_KEYWORDS) {
        if (text.includes(kw)) {
          supportNegCount++;
          break;
        }
      }
    }
  }

  if (billingNegCount >= 2) {
    riskFlags.push({
      type: 'BILLING_FAILURES',
      severity: billingNegCount >= 5 ? 'HIGH' : 'MEDIUM',
      count: billingNegCount,
      description: `${billingNegCount} negative feedback items mention billing, invoice, or payment issues`,
      channel: 'support_ticket',
    });
  }
  if (performanceNegCount >= 2) {
    riskFlags.push({
      type: 'PERFORMANCE_BOTTLENECKS',
      severity: performanceNegCount >= 5 ? 'HIGH' : 'MEDIUM',
      count: performanceNegCount,
      description: `${performanceNegCount} negative feedback items cite slow performance, crashes, or bugs`,
      channel: 'app_store',
    });
  }
  if (supportNegCount >= 2) {
    riskFlags.push({
      type: 'SUPPORT_DELAYS',
      severity: supportNegCount >= 5 ? 'HIGH' : 'MEDIUM',
      count: supportNegCount,
      description: `${supportNegCount} negative feedback items report slow support response or unresolved tickets`,
      channel: 'support_ticket',
    });
  }

  const positiveDrivers = Object.entries(posKeywordsMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([keyword, frequency]) => ({ keyword, frequency, impact: 'HIGH' }));

  const negativeDrivers = Object.entries(negKeywordsMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([keyword, frequency]) => ({ keyword, frequency, impact: 'HIGH' }));

  return {
    netSentimentIndex,
    csat,
    sentimentDistribution,
    sentimentByChannel,
    sentimentByTheme,
    keywordDrivers: {
      positive: positiveDrivers,
      negative: negativeDrivers,
    },
    riskFlags,
    totalAnalyzed: total,
    timeframe,
    channel,
  };
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = (session.user as { workspaceId?: string }).workspaceId;
  const { searchParams } = new URL(req.url);
  const timeframe = searchParams.get('timeframe') || '30d';
  const channel = searchParams.get('channel') || 'ALL';

  const now = new Date();
  const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 365;
  const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  let feedbacks: AnalysisFeedback[] = [];

  try {
    const dbFeedbacks = await prisma.feedback.findMany({
      where: {
        workspaceId,
        createdAt: { gte: periodStart },
        ...(channel !== 'ALL' ? { channel } : {}),
      },
      include: {
        themes: {
          include: { theme: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    feedbacks = dbFeedbacks.map((f) => ({
      id: f.id,
      content: f.content,
      channel: f.channel,
      sentiment: f.sentiment,
      createdAt: f.createdAt,
      themes: f.themes.map((ft) => ({ theme: { name: ft.theme.name } })),
    }));
  } catch (e) {
    console.error('Analysis fetch error, falling back to demo data:', e);
  }

  if (feedbacks.length === 0) {
    feedbacks = DEMO_FEEDBACKS.map((f) => toAnalysisInput(f))
      .filter((f) => f.createdAt >= periodStart)
      .filter((f) => (channel !== 'ALL' ? f.channel === channel : true));
  }

  return NextResponse.json(computeAnalysis(feedbacks, timeframe, channel));
}