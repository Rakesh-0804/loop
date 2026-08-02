"use client";

import { useState } from "react";

import FeedbackHeader from "@/app/components/feedback/FeedbackHeader";
import FeedbackSummary from "@/app/components/feedback/FeedbackSummary";
import FeedbackFilters from "@/app/components/feedback/FeedbackFilters";
import FeedbackTable from "@/app/components/feedback/FeedbackTable";
import AddFeedbackModal from "@/app/components/feedback/AddFeedbackModal";

export default function FeedbackPage() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="space-y-6 p-6">
      <FeedbackHeader
        onAddFeedback={() => setOpenModal(true)}
      />

      <FeedbackSummary />

      <FeedbackFilters />

      <FeedbackTable />

      <AddFeedbackModal
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </div>
  );
}