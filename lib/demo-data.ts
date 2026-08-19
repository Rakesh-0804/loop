export type DemoFeedback = {
  id: string;
  content: string;
  channel: string;
  sourceRef: string;
  customerLabel: string;
  sentiment: 'POS' | 'NEU' | 'NEG';
  sentimentScore: number;
  status: string;
  createdAt: string;
  themes: { theme: { id: string; name: string; color: string } }[];
};

export const DEMO_FEEDBACKS: DemoFeedback[] = [];