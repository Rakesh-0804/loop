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
  keyActionItems: string[];
}

/**
 * Real AI Sentiment & Theme Classifier using Gemini 3.6 Flash
 */
export async function analyzeFeedbackAI(content: string, availableThemes: string[] = []): Promise<AIAnalysisResult> {
  if (aiClient) {
    try {
      const prompt = `You are an expert customer feedback intelligence AI. Analyze the following customer feedback text.
      
Feedback Text: "${content}"
Available Themes: ${JSON.stringify(availableThemes)}

Return ONLY a valid JSON object matching this exact schema:
{
  "sentiment": "POS" | "NEU" | "NEG",
  "sentimentScore": float between 0.0 and 1.0,
  "themes": string[] (up to 3 matching theme names from Available Themes or new relevant categories)
}`;

      const response = await aiClient.interactions.create({
        model: 'gemini-3.6-flash',
        input: prompt,
      });

      const outputText = response.output_text || '';
      const cleanJson = outputText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        sentiment: parsed.sentiment || 'NEU',
        sentimentScore: typeof parsed.sentimentScore === 'number' ? parsed.sentimentScore : 0.7,
        themes: Array.isArray(parsed.themes) ? parsed.themes : ['General Usability'],
      };
    } catch (e) {
      console.error('Gemini API Error, falling back to local engine:', e);
    }
  }

  // Fallback NLP Engine
  const text = content.toLowerCase();
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

  const themes: string[] = [];
  if (text.includes('load') || text.includes('speed') || text.includes('performance') || text.includes('fast') || text.includes('slow')) themes.push('Performance & Speed');
  if (text.includes('ui') || text.includes('ux') || text.includes('layout') || text.includes('mobile') || text.includes('design')) themes.push('UI/UX Usability');
  if (text.includes('bill') || text.includes('tax') || text.includes('price') || text.includes('invoice')) themes.push('Billing & Subscriptions');
  if (text.includes('slack') || text.includes('webhook') || text.includes('integration') || text.includes('api')) themes.push('Integrations & Webhooks');
  if (text.includes('pdf') || text.includes('export') || text.includes('feature') || text.includes('add')) themes.push('Feature Requests');
  if (themes.length === 0) themes.push('Customer Usability');

  return { sentiment, sentimentScore, themes };
}

/**
 * Real Executive Summary Generator using Gemini 3.6 Flash
 */
export async function generateReportAI(feedbacks: any[], themes: any[], reportTitle: string): Promise<AIReportResult> {
  const totalAnalyzed = feedbacks.length;
  const posCount = feedbacks.filter((f) => f.sentiment === 'POS').length;
  const positiveRatio = totalAnalyzed > 0 ? parseFloat((posCount / totalAnalyzed).toFixed(2)) : 0.7;

  if (aiClient && totalAnalyzed > 0) {
    try {
      const prompt = `You are a Chief Product Officer AI. Synthesize an executive report based on customer feedback items.

Report Title: ${reportTitle}
Total Items: ${totalAnalyzed}
Positive Ratio: ${(positiveRatio * 100).toFixed(0)}%
Sample Feedbacks: ${JSON.stringify(feedbacks.slice(0, 10).map((f) => ({ content: f.content, channel: f.channel, sentiment: f.sentiment })))}
Tracked Themes: ${JSON.stringify(themes.map((t) => t.name))}

Return ONLY a valid JSON object matching this schema:
{
  "summary": "2-3 sentence executive synthesis paragraph",
  "topThemes": ["string array of top 3 recurring theme names"],
  "keyActionItems": ["string array of 3 prioritized strategic recommendations"]
}`;

      const response = await aiClient.interactions.create({
        model: 'gemini-3.6-flash',
        input: prompt,
      });

      const outputText = response.output_text || '';
      const cleanJson = outputText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        summary: parsed.summary,
        topThemes: parsed.topThemes || themes.slice(0, 3).map((t) => t.name),
        totalAnalyzed,
        positiveRatio,
        keyActionItems: parsed.keyActionItems || [],
      };
    } catch (e) {
      console.error('Gemini Report Synthesis Error, using fallback:', e);
    }
  }

  // Fallback Executive Synthesis
  const topThemesList = themes.slice(0, 3).map((t) => t.name);
  return {
    summary: `Executive Feedback Intelligence Summary: ${totalAnalyzed} feedback items analyzed across ${themes.length} active theme clusters. Overall positive customer sentiment score stands at ${(positiveRatio * 100).toFixed(0)}%.`,
    topThemes: topThemesList.length > 0 ? topThemesList : ['Performance & Speed', 'UI/UX Usability', 'Feature Requests'],
    totalAnalyzed,
    positiveRatio,
    keyActionItems: [
      'Prioritize high-volume customer feature requests in upcoming product sprint.',
      'Optimize infrastructure for peak feedback query throughput.',
      'Review pending support tickets with negative sentiment tags.',
    ],
  };
}
