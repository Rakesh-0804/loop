"use client";

import { Star } from "lucide-react";

type Props = {
  rating: number;
  onChange: (rating: number) => void;
};

export default function StarRating({
  rating,
  onChange,
}: Props) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className="transition hover:scale-110"
        >
          <Star
            size={28}
            fill={value <= rating ? "#facc15" : "none"}
            className={
              value <= rating
                ? "text-yellow-400"
                : "text-slate-300"
            }
          />
        </button>
      ))}
    </div>
  );
}