"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

import { Feedback } from "@/app/types/feedback";
import { mockFeedback } from "@/app/types/mockFeedback";

type NewFeedback = Omit<
  Feedback,
  "id" | "date" | "status"
>;

type FeedbackContextType = {
  feedback: Feedback[];

  addFeedback: (item: NewFeedback) => void;

  updateFeedback: (item: Feedback) => void;

  deleteFeedback: (id: number) => void;
};

const FeedbackContext =
  createContext<FeedbackContextType | undefined>(
    undefined
  );

export function FeedbackProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [feedback, setFeedback] =
    useState<Feedback[]>(mockFeedback);

  const addFeedback = (item: NewFeedback) => {
    const newFeedback: Feedback = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),

      status: "Pending",

      ...item,
    };

    setFeedback((prev) => [
      newFeedback,
      ...prev,
    ]);
  };

  const updateFeedback = (
    updated: Feedback
  ) => {
    setFeedback((prev) =>
      prev.map((item) =>
        item.id === updated.id ? updated : item
      )
    );
  };

  const deleteFeedback = (id: number) => {
    setFeedback((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  return (
    <FeedbackContext.Provider
      value={{
        feedback,
        addFeedback,
        updateFeedback,
        deleteFeedback,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context =
    useContext(FeedbackContext);

  if (!context) {
    throw new Error(
      "useFeedback must be used inside FeedbackProvider."
    );
  }

  return context;
}