import { useEffect, useRef, useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { trackProductEvent } from "@/lib/productAnalytics.mjs";
import {
  buildFeedbackAnalyticsProperties,
  normalizeProductFeedback,
  PRODUCT_FEEDBACK_CATEGORIES,
  PRODUCT_FEEDBACK_MAX_LENGTH,
} from "@/lib/productFeedback.mjs";

type FeedbackCategory = "bug" | "confusing" | "idea" | "praise" | "other";

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  bug: "Something is broken",
  confusing: "Something is confusing",
  idea: "I have an idea",
  praise: "Something worked well",
  other: "Other",
};

export default function FeedbackLauncher() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>("idea");
  const [rating, setRating] = useState<number | "">("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!open) return;
    textareaRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, submitting]);

  if (!user) return null;

  const submitFeedback = async () => {
    if (!supabase || submitting) return;

    const normalized = normalizeProductFeedback({
      category,
      rating,
      feedback,
      pagePath: window.location.pathname,
    });

    if (!normalized.ok) {
      toast({
        title: "Add a little more detail",
        description: normalized.error,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("product_feedback").insert({
        user_id: user.id,
        ...normalized.data,
      });
      if (error) throw error;

      trackProductEvent(
        "Feedback Submitted",
        buildFeedbackAnalyticsProperties({ category, rating }),
      );

      setFeedback("");
      setRating("");
      setCategory("idea");
      setOpen(false);
      toast({
        title: "Thanks — feedback saved",
        description: "Your note is tied to your account for follow-up, but its text is not sent to product analytics.",
      });
    } catch {
      toast({
        title: "Feedback was not saved",
        description: "Please try again. Your note stays in this form until submission succeeds.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/95 px-4 py-3 text-sm font-medium shadow-lg backdrop-blur transition hover:border-primary/60 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Give VertexED feedback"
      >
        <MessageSquare className="h-4 w-4" aria-hidden="true" />
        Feedback
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 sm:items-center"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) setOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-feedback-title"
            aria-describedby="product-feedback-description"
            className="w-full max-w-lg rounded-2xl border border-border bg-background p-5 shadow-2xl sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="product-feedback-title" className="text-xl font-semibold">
                  Help improve VertexED
                </h2>
                <p id="product-feedback-description" className="mt-1 text-sm text-muted-foreground">
                  Tell us what happened. Please avoid passwords, private documents, or other sensitive information.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={submitting}
                className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                aria-label="Close feedback form"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">What kind of feedback?</span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value as FeedbackCategory)}
                  className="neu-input-el w-full"
                  disabled={submitting}
                >
                  {(PRODUCT_FEEDBACK_CATEGORIES as readonly FeedbackCategory[]).map((value) => (
                    <option key={value} value={value}>
                      {CATEGORY_LABELS[value]}
                    </option>
                  ))}
                </select>
              </label>

              <fieldset>
                <legend className="mb-2 text-sm font-medium">Overall experience (optional)</legend>
                <div className="flex flex-wrap gap-2" aria-label="Overall experience rating">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      aria-pressed={rating === value}
                      disabled={submitting}
                      className={`min-h-10 min-w-10 rounded-lg border px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 ${
                        rating === value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Your feedback</span>
                <textarea
                  ref={textareaRef}
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                  maxLength={PRODUCT_FEEDBACK_MAX_LENGTH}
                  rows={5}
                  disabled={submitting}
                  className="neu-input-el w-full resize-y"
                  placeholder="What worked, what broke, or what should change?"
                />
                <span className="mt-1 block text-right text-xs text-muted-foreground">
                  {feedback.length}/{PRODUCT_FEEDBACK_MAX_LENGTH}
                </span>
              </label>

              <p className="text-xs leading-relaxed text-muted-foreground">
                Feedback text is stored with your authenticated account ID so the team can investigate. Product analytics receives only the category and optional 1–5 rating.
              </p>

              <button
                type="button"
                onClick={() => void submitFeedback()}
                disabled={submitting || !feedback.trim() || !supabase}
                className="neu-button w-full px-4 py-3 font-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Sending…" : supabase ? "Send feedback" : "Feedback unavailable"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
