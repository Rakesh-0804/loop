import { Feedback } from "@/app/types/feedback";

export const mockFeedback: Feedback[] = [
  {
    id: 1,
    name: "John Smith",
    email: "john@example.com",
    rating: 5,
    sentiment: "Positive",
    category: "Delivery",
    status: "Reviewed",
    date: "Today",
    comment: "Fast delivery and excellent service.",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    rating: 2,
    sentiment: "Negative",
    category: "Payment",
    status: "Flagged",
    date: "Yesterday",
    comment: "Payment failed multiple times.",
  },
  {
    id: 3,
    name: "David Lee",
    email: "david@example.com",
    rating: 4,
    sentiment: "Positive",
    category: "Support",
    status: "Reviewed",
    date: "2 days ago",
    comment: "Support team resolved my issue quickly.",
  },
];