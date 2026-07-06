"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { HelpCircle, MessageCircle } from "lucide-react";
import { toast } from "react-toastify";
import { questionsApi, getErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { QuestionListResponse } from "@/types";

export function QASection({ productId }: { productId: string }) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useQuery<QuestionListResponse>({
    queryKey: ["questions", productId],
    queryFn: async () => {
      const { data } = await questionsApi.list(productId);
      return data;
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (question.trim().length < 3) {
      toast.error("Question is too short");
      return;
    }
    setSubmitting(true);
    try {
      await questionsApi.ask(productId, question.trim());
      toast.success("Question submitted — our team will answer soon.");
      setQuestion("");
      queryClient.invalidateQueries({ queryKey: ["questions", productId] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const questions = data?.items ?? [];

  return (
    <div className="space-y-6">
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="card p-4 space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm flex items-center gap-2">
            <HelpCircle size={16} className="text-primary-700" />
            Ask a question about this product
          </h3>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Does this come with a warranty card?"
            rows={2}
            className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-500"
          />
          <button type="submit" disabled={submitting} className="btn-primary text-sm h-9 px-5">
            {submitting ? "Submitting…" : "Ask Question"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500">
          <a href="/login" className="text-primary-700 hover:underline">Log in</a> to ask a question.
        </p>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="skeleton h-16 rounded-lg" />)}
        </div>
      ) : questions.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No questions yet. Ask the first one.</p>
      ) : (
        <ul className="space-y-4">
          {questions.map((q) => (
            <li key={q.id} className="border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-start gap-2">
                <HelpCircle size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{q.question}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {q.user_name} · {new Date(q.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {q.answer ? (
                <div className="flex items-start gap-2 mt-2 ml-6">
                  <MessageCircle size={15} className="text-primary-700 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{q.answer}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Answered {q.answered_at ? new Date(q.answered_at).toLocaleDateString() : ""}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-2 ml-6 italic">Not answered yet</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
