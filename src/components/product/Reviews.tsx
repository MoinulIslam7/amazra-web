"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ThumbsUp, ShieldCheck, Star } from "lucide-react";
import { toast } from "react-toastify";
import { reviewsApi, getErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Rating } from "@/components/ui/Rating";
import type { ReviewListResponse } from "@/types";

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} stars`}>
          <Star
            size={22}
            className={n <= value ? "text-yellow-400" : "text-gray-300"}
            fill={n <= value ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
}

export function Reviews({ productId }: { productId: string }) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useQuery<ReviewListResponse>({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data } = await reviewsApi.list(productId);
      return data;
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    setSubmitting(true);
    try {
      await reviewsApi.create(productId, { rating, title: title || undefined, comment: comment || undefined });
      toast.success("Review submitted — thank you!");
      setRating(0);
      setTitle("");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleHelpful(reviewId: string) {
    if (!isAuthenticated) {
      toast.info("Log in to mark reviews as helpful");
      return;
    }
    try {
      await reviewsApi.markHelpful(reviewId);
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  const reviews = data?.items ?? [];

  return (
    <div className="space-y-6">
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="card p-4 space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Write a review</h3>
          <StarInput value={rating} onChange={setRating} />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Review title (optional)"
            className="w-full h-9 px-3 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-500"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product (optional)"
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-500"
          />
          <button type="submit" disabled={submitting} className="btn-primary text-sm h-9 px-5">
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500">
          <a href="/login" className="text-primary-700 hover:underline">Log in</a> to write a review.
        </p>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="skeleton h-20 rounded-lg" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No reviews yet. Be the first to review this product.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Rating value={r.rating} size="sm" />
                {r.is_verified_purchase && (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <ShieldCheck size={13} />
                    Verified Purchase
                  </span>
                )}
              </div>
              {r.title && <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{r.title}</p>}
              {r.comment && <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{r.comment}</p>}
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span>{r.user_name}</span>
                <span>·</span>
                <span>{new Date(r.created_at).toLocaleDateString()}</span>
                <button
                  onClick={() => handleHelpful(r.id)}
                  className="flex items-center gap-1 hover:text-primary-700 ml-auto"
                >
                  <ThumbsUp size={13} />
                  Helpful ({r.helpful_count})
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
