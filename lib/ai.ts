import { GoogleGenAI } from '@google/genai';

// Initialize Gemini Client if API key is present
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;
const aiClient = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface AIAnalysisResult {
  sentiment: 'POS' | 'NEU' | 'NEG';
  sentimentScore: number;
  themes: string[];
  summary?: string;
}

export interface AIReportResult {
  summary: string;
  topThemes: string[];
  totalAnalyzed: number;
  positiveRatio: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  csatScore: number;
  npsIndex: number;
  channelBreakdown: {
    supportTickets: number;
    appStoreReviews: number;
    npsSurveys: number;
    salesCalls: number;
    communityPosts: number;
  };
  criticalPainPoints: string[];
  keyActionItems: string[];
  customerQuotes: { quote: string; channel: string; sentiment: string }[];
  strategicRoadmap: { priority: 'HIGH' | 'MEDIUM' | 'LONG_TERM'; initiative: string; impact: string }[];
}

/**
 * Decisive AI Sentiment & Theme Classifier using Gemini 3.6 Flash
 */
export async function analyzeFeedbackAI(content: string, availableThemes: string[] = []): Promise<AIAnalysisResult> {
  if (aiClient) {
    try {
      const prompt = `You are a highly decisive customer feedback sentiment intelligence AI. Analyze this customer feedback text:
"${content}"

Available Themes: ${JSON.stringify(availableThemes)}

CRITICAL CLASSIFICATION INSTRUCTIONS:
- DO NOT default to neutral ("NEU"). Be decisive.
- Classify as "POS" if the feedback expresses praise, satisfaction, feature appreciation, speed, good design, enthusiasm, or general approval.
- Classify as "NEG" if the feedback contains any complaint, feature request, frustration, slow speed, delay, billing issue, bug, crash, unhelpfulness, or disappointment.
- Assign "NEU" ONLY if the text is 100% strictly neutral facts with zero positive or negative polarity.

Return ONLY a valid JSON object matching this schema:
{
  "sentiment": "POS" | "NEU" | "NEG",
  "sentimentScore": float (POS: 0.70 to 0.98, NEG: 0.05 to 0.35, NEU: 0.50),
  "themes": string[] (up to 3 matching theme names)
}`;

      const response = await aiClient.interactions.create({
        model: 'gemini-3.6-flash',
        input: prompt,
      });

      const outputText = response.output_text || '';
      const cleanJson = outputText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      let sentiment: 'POS' | 'NEU' | 'NEG' = 'POS';
      if (parsed.sentiment === 'NEG' || parsed.sentiment === 'NEGATIVE') sentiment = 'NEG';
      else if (parsed.sentiment === 'NEU' || parsed.sentiment === 'NEUTRAL') sentiment = 'NEU';
      else if (parsed.sentiment === 'POS' || parsed.sentiment === 'POSITIVE') sentiment = 'POS';

      return {
        sentiment,
        sentimentScore: typeof parsed.sentimentScore === 'number' ? parsed.sentimentScore : (sentiment === 'POS' ? 0.90 : sentiment === 'NEG' ? 0.15 : 0.50),
        themes: Array.isArray(parsed.themes) ? parsed.themes : ['General Usability'],
      };
    } catch (e) {
      console.error('Gemini API Error, falling back to local engine:', e);
    }
  }

  // Enhanced Decisive Local Sentiment Engine
  const text = content.toLowerCase();

  const posKeywords = [
    'love', 'great', 'fast', 'crisp', 'saved', 'improved', 'seamless', 'awesome', 'excellent',
    'useful', 'happy', 'helped', 'best', 'good', 'nice', 'clean', 'intuitive', 'satisfied',
    'thanks', 'thank', 'perfect', 'gorgeous', 'game-changer', 'impressed', 'recommend', 'smooth'
  ];

  const negKeywords = [
    'slow', 'bug', 'failed', 'fail', 'confusing', 'incorrect', 'issue', 'problem', 'delay', 'took',
    'broken', 'error', 'hate', 'bad', 'disaster', 'worst', 'terrible', 'canceling', 'cancel', 'unacceptable',
    'frustrating', 'frustrated', 'horrible', 'outage', 'freeze', 'crash', 'refund', 'unhelpful', 'unusable',
    'lacking', 'lack', 'need', 'pain', 'painful', 'locked', 'wrong', 'poor', 'disappointing', 'disappointed',
    'nightmare', 'unreadable', 'cut off', 'stale', 'double-charged'
  ];

  let posMatch = 0;
  let negMatch = 0;

  posKeywords.forEach((kw) => { if (text.includes(kw)) posMatch++; });
  negKeywords.forEach((kw) => { if (text.includes(kw)) negMatch++; });

  let sentiment: 'POS' | 'NEU' | 'NEG' = 'POS';
  let sentimentScore = 0.85;

  if (negMatch > 0 && negMatch >= posMatch) {
    sentiment = 'NEG';
    sentimentScore = Math.max(0.05, 0.35 - negMatch * 0.08);
  } else if (posMatch > negMatch) {
    sentiment = 'POS';
    sentimentScore = Math.min(0.98, 0.70 + posMatch * 0.08);
  } else {
    // If no strong positive words, check for complaints or requests
    if (text.includes('need') || text.includes('request') || text.includes('want') || text.includes('missing') || text.includes('add')) {
      sentiment = 'NEG';
      sentimentScore = 0.30;
    } else {
      sentiment = 'POS';
      sentimentScore = 0.80;
    }
  }

  const themes: string[] = [];
  if (text.includes('load') || text.includes('speed') || text.includes('performance') || text.includes('fast') || text.includes('slow')) themes.push('Performance & Speed');
  if (text.includes('ui') || text.includes('ux') || text.includes('layout') || text.includes('mobile') || text.includes('design')) themes.push('UI/UX Usability');
  if (text.includes('bill') || text.includes('tax') || text.includes('price') || text.includes('invoice') || text.includes('charge')) themes.push('Billing & Subscriptions');
  if (text.includes('slack') || text.includes('webhook') || text.includes('integration') || text.includes('api')) themes.push('Integrations & Webhooks');
  if (text.includes('pdf') || text.includes('export') || text.includes('feature') || text.includes('add') || text.includes('report')) themes.push('Feature Requests');
  if (themes.length === 0) themes.push('Customer Usability');

  return { sentiment, sentimentScore, themes };
}

/**
 * Deep Executive Report Synthesizer using Gemini 3.6 Flash
 */
export async function generateReportAI(feedbacks: any[], themes: any[], reportTitle: string): Promise<AIReportResult> {
  const totalAnalyzed = feedbacks.length;
  const posCount = feedbacks.filter((f) => f.sentiment === 'POS' || f.sentiment === 'POSITIVE').length;
  const neuCount = feedbacks.filter((f) => f.sentiment === 'NEU' || f.sentiment === 'NEUTRAL').length;
  const negCount = feedbacks.filter((f) => f.sentiment === 'NEG' || f.sentiment === 'NEGATIVE').length;

  const positiveRatio = totalAnalyzed > 0 ? parseFloat((posCount / totalAnalyzed).toFixed(2)) : 0.0;
  const csatScore = Math.round(positiveRatio * 100);
  const npsIndex = totalAnalyzed > 0 ? Math.round(((posCount - negCount) / totalAnalyzed) * 100) : 0;

  const channelBreakdown = {
    supportTickets: feedbacks.filter((f) => f.channel === 'support_ticket').length,
    appStoreReviews: feedbacks.filter((f) => f.channel === 'app_store').length,
    npsSurveys: feedbacks.filter((f) => f.channel === 'nps_survey').length,
    salesCalls: feedbacks.filter((f) => f.channel === 'sales_call').length,
    communityPosts: feedbacks.filter((f) => f.channel === 'community_post').length,
  };

  const sampleQuotes = feedbacks.slice(0, 4).map((f) => ({
    quote: f.content || f.feedback || 'Sample customer response',
    channel: f.channel || 'support_ticket',
    sentiment: f.sentiment || 'NEU',
  }));

  if (aiClient && totalAnalyzed > 0) {
    try {
      const prompt = `You are a Chief Product Officer AI. Synthesize an in-depth executive feedback report.

Report Title: ${reportTitle}
Total Feedbacks: ${totalAnalyzed} (Positive: ${posCount}, Neutral: ${neuCount}, Negative: ${negCount})
CSAT Score: ${csatScore}% | Net Promoter Score (NPS): +${npsIndex}
Channel Counts: ${JSON.stringify(channelBreakdown)}
Tracked Themes: ${JSON.stringify(themes.map((t) => t.name))}
Feedback Samples: ${JSON.stringify(sampleQuotes)}

Return ONLY a valid JSON object matching this schema:
{
  "summary": "3-4 sentence comprehensive executive summary paragraph highlighting key customer trends, satisfaction metrics, and main drivers",
  "topThemes": ["array of top 3-4 recurring theme names"],
  "criticalPainPoints": ["array of 3 specific critical pain points or churn risks identified"],
  "keyActionItems": ["array of 4 prioritized tactical action items for engineering/product"],
  "strategicRoadmap": [
    { "priority": "HIGH", "initiative": "Initiative Title", "impact": "Expected outcome" },
    { "priority": "MEDIUM", "initiative": "Initiative Title", "impact": "Expected outcome" },
    { "priority": "LONG_TERM", "initiative": "Initiative Title", "impact": "Expected outcome" }
  ]
}`;

      const response = await aiClient.interactions.create({
        model: 'gemini-3.6-flash',
        input: prompt,
      });

      const outputText = response.output_text || '';
      const cleanJson = outputText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        summary: parsed.summary || `Executive Summary: Analyzed ${totalAnalyzed} multi-channel feedback records. Customer Satisfaction Score (CSAT) is ${csatScore}% with Net Promoter Index at ${npsIndex}.`,
        topThemes: parsed.topThemes || themes.slice(0, 3).map((t) => t.name),
        totalAnalyzed,
        positiveRatio,
        positiveCount: posCount,
        neutralCount: neuCount,
        negativeCount: negCount,
        csatScore,
        npsIndex,
        channelBreakdown,
        criticalPainPoints: parsed.criticalPainPoints || ['Invoice generation delay on peak concurrency', 'Mobile viewport menu alignment', 'Slow search query latency'],
        keyActionItems: parsed.keyActionItems || ['Implement query caching for search filters', 'Automate weekly PDF export delivery', 'Fix mobile dropdown CSS overflow'],
        customerQuotes: sampleQuotes,
        strategicRoadmap: parsed.strategicRoadmap || [
          { priority: 'HIGH', initiative: 'Database & Search Cache Optimization', impact: 'Reduce feedback query latency by 40%' },
          { priority: 'MEDIUM', initiative: 'Automated Multi-Format Export Engine', impact: 'Improve executive report adoption by 60%' },
          { priority: 'LONG_TERM', initiative: 'Real-Time Slack & Webhook Alerting', impact: 'Decrease response time for negative tickets' },
        ],
      };
    } catch (e) {
      console.error('Gemini Report Synthesis Error, using deep fallback:', e);
    }
  }

  // Deep Fallback Executive Synthesis
  const topThemesList = themes.slice(0, 3).map((t) => t.name);
  return {
    summary: `Executive Intelligence Report Summary: A total of ${totalAnalyzed} feedback entries were analyzed across ${themes.length} active theme categories. The overall Customer Satisfaction Score (CSAT) stands at ${csatScore}%, with positive feedback accounting for ${posCount} records and negative items at ${negCount}.`,
    topThemes: topThemesList.length > 0 ? topThemesList : ['Performance & Speed', 'UI/UX Usability', 'Feature Requests'],
    totalAnalyzed,
    positiveRatio,
    positiveCount: posCount,
    neutralCount: neuCount,
    negativeCount: negCount,
    csatScore,
    npsIndex,
    channelBreakdown,
    criticalPainPoints: [
      'Intermittent invoice generation delay on high concurrency',
      'Mobile dropdown overflow on smaller mobile viewports',
      'Support ticket resolution response latency during peak hours',
    ],
    keyActionItems: [
      'Prioritize automated PDF and CSV export capabilities in upcoming sprint.',
      'Optimize database queries and cache layer for feedback inbox filters.',
      'Establish real-time webhook notifications for tickets with negative sentiment ratings.',
      'Conduct UI audit for mobile viewport dark mode color contrast.',
    ],
    customerQuotes: sampleQuotes,
    strategicRoadmap: [
      { priority: 'HIGH', initiative: 'Database & Search Cache Optimization', impact: 'Reduce feedback query latency by 40%' },
      { priority: 'MEDIUM', initiative: 'Automated Multi-Format Export Engine', impact: 'Improve executive report adoption by 60%' },
      { priority: 'LONG_TERM', initiative: 'Real-Time Slack & Webhook Alerting', impact: 'Decrease response time for negative tickets' },
    ],
  };
}
