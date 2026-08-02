export interface Feedback {
  id: number;
  name: string;
  email: string;
  rating: number;
  sentiment: "Positive" | "Neutral" | "Negative";
  category: string;
  status: "Reviewed" | "Pending" | "Flagged";
  date: string;
  comment: string;
}