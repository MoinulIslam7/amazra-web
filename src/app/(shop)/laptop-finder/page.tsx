"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Laptop, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { finderApi } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { formatPrice, cn } from "@/lib/utils";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import type { FinderQuestion, FinderResult } from "@/types";

export default function LaptopFinderPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({ budget_max: 100000 });
  const [results, setResults] = useState<FinderResult[] | null>(null);

  const { data: questions = [], isLoading } = useQuery<FinderQuestion[]>({
    queryKey: ["finder-questions"],
    queryFn: async () => {
      const { data } = await finderApi.questions();
      return data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { data } = await finderApi.results(answers);
      return data as FinderResult[];
    },
    onSuccess: (data) => {
      setResults(data);
      trackEvent("laptop_finder_completed", { ...answers, results_count: data.length });
    },
  });

  const question = questions[step];
  const isLastStep = step === questions.length - 1;
  const canProceed = question ? answers[question.id] !== undefined && answers[question.id] !== "" : false;

  function handleAnswer(id: string, value: string | number) {
    setAnswers((a) => ({ ...a, [id]: value }));
  }

  function handleNext() {
    if (isLastStep) {
      submitMutation.mutate();
    } else {
      setStep((s) => s + 1);
    }
  }

  function handleRestart() {
    setStep(0);
    setAnswers({ budget_max: 100000 });
    setResults(null);
  }

  return (
    <div className="container-page py-4 max-w-2xl">
      <Breadcrumb items={[{ label: "Laptop Finder" }]} />

      <div className="text-center mb-8 mt-4">
        <Laptop size={40} className="mx-auto text-primary-700 mb-2" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Laptop Finder</h1>
        <p className="text-sm text-gray-500 mt-1">
          Answer a few quick questions and we&apos;ll recommend the best laptops for you.
        </p>
      </div>

      {results ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Sparkles size={18} className="text-primary-700" />
              Top Matches
            </h2>
            <button onClick={handleRestart} className="text-sm text-primary-700 hover:underline">
              Start Over
            </button>
          </div>

          {results.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">
              No laptops matched your criteria. Try adjusting your budget.
            </p>
          ) : (
            <ul className="space-y-3">
              {results.map((r) => (
                <li key={r.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <a href={`/products/${r.slug}`} className="font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-700">
                        {r.name}
                      </a>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {r.brand} {r.category ? `· ${r.category}` : ""}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {r.match_explanation.map((e, i) => (
                          <span
                            key={i}
                            className="text-[11px] bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full"
                          >
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="font-bold text-primary-700 whitespace-nowrap">
                      {formatPrice(r.price)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : isLoading || !question ? (
        <div className="skeleton h-48 rounded-lg" />
      ) : (
        <div className="card p-6">
          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-primary-700 transition-all"
              style={{ width: `${((step + 1) / questions.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mb-2">
            Step {step + 1} of {questions.length}
          </p>

          <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-5">{question.label}</h2>

          {question.type === "number" ? (
            <div className="space-y-3">
              <input
                type="range"
                min={question.min ?? 0}
                max={question.max ?? 500000}
                step={question.step ?? 1000}
                value={Number(answers[question.id] ?? question.min ?? 0)}
                onChange={(e) => handleAnswer(question.id, Number(e.target.value))}
                className="w-full accent-primary-700"
              />
              <p className="text-center font-bold text-primary-700 text-lg">
                {formatPrice(Number(answers[question.id] ?? 0))}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {question.options?.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(question.id, opt)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium rounded-lg border capitalize transition-colors",
                    answers[question.id] === opt
                      ? "border-primary-700 bg-primary-50 text-primary-700"
                      : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-300"
                  )}
                >
                  {opt.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-0"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed || submitMutation.isPending}
              className="btn-primary text-sm h-10 px-6 flex items-center gap-1"
            >
              {isLastStep ? (submitMutation.isPending ? "Finding…" : "See Results") : "Next"}
              {!isLastStep && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
