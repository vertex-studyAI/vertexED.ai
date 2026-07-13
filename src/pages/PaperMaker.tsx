import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import PageSection from "@/components/PageSection";
import NeumorphicCard from "@/components/NeumorphicCard";
import { authFetch } from "@/lib/apiAuth";
import { useAuth } from "@/contexts/AuthContext";
import {
  BOARD_CONFIGS,
  EXAM_BOARDS,
  boardToApiLabel,
  getGradesForBoard,
  getSubjectsForBoard,
} from "@/lib/curriculum";
import type { ExamBoard } from "@/types/curriculum";

type Availability = {
  available: boolean;
  message: string;
  questionCount: number;
  subject: { id: string; title: string } | null;
};

type SessionItem = {
  id: string;
  ordinal: number;
  externalReference: string;
  questionText: string;
  questionType: string;
  marks: number;
  questionPayload?: { choices?: string[] };
};

type SessionState = {
  id: string;
  status: string;
  sessionType: string;
  items: SessionItem[];
};

type SubmissionResult = {
  sessionItemId: string;
  score: number | null;
  maxScore: number | null;
  status: string;
  message: string;
};

export default function PaperMaker() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [board, setBoard] = useState<ExamBoard>("IB_MYP");
  const [grade, setGrade] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [session, setSession] = useState<SessionState | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState<{
    verifiedScore: number;
    verifiedMaxScore: number;
    results: SubmissionResult[];
  } | null>(null);
  const [sessionError, setSessionError] = useState("");
  const [sessionType, setSessionType] = useState<"diagnostic" | "practice" | "mock">("practice");
  const [savedItems, setSavedItems] = useState<Record<string, boolean>>({});

  const grades = useMemo(() => getGradesForBoard(board), [board]);
  const subjects = useMemo(() => getSubjectsForBoard(board, grade), [board, grade]);

  useEffect(() => {
    const pref = user?.user_metadata;
    if (!pref) return;
    const rawBoard = pref.board ?? (pref.preferences as Record<string, unknown> | undefined)?.board;
    if (typeof rawBoard === "string" && EXAM_BOARDS.includes(rawBoard as ExamBoard)) {
      setBoard(rawBoard as ExamBoard);
    }
    const rawGrade = pref.grade ?? (pref.preferences as Record<string, unknown> | undefined)?.grade;
    if (typeof rawGrade === "number") setGrade(rawGrade);
    else if (typeof rawGrade === "string" && rawGrade) setGrade(Number(rawGrade));
    const rawSubjects = pref.subjects ?? (pref.preferences as Record<string, unknown> | undefined)?.subjects;
    if (Array.isArray(rawSubjects) && rawSubjects[0]) setSubject(String(rawSubjects[0]));
  }, [user]);

  useEffect(() => {
    const subjectParam = searchParams.get("subject");
    if (subjectParam) setSubject((current) => current || subjectParam);
  }, [searchParams]);

  useEffect(() => {
    setAvailability(null);
    setSession(null);
    setSubmission(null);
    setAnswers({});
    setSavedItems({});
    setSessionError("");
  }, [board, grade, subject]);

  async function checkAvailability() {
    setAvailabilityLoading(true);
    setAvailabilityError("");
    try {
      const res = await authFetch("/api/exam-catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "availability",
          board: boardToApiLabel(board),
          subject,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAvailability(null);
        setAvailabilityError(data.error || "Could not load catalogue availability.");
        return;
      }
      setAvailability(data.availability);
    } catch (error) {
      setAvailabilityError(String(error));
    } finally {
      setAvailabilityLoading(false);
    }
  }

  async function startVerifiedPractice() {
    setSessionError("");
    setSubmitting(true);
    try {
      const res = await authFetch("/api/exam-catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start_session",
          board: boardToApiLabel(board),
          subject,
          sessionType,
          itemCount: sessionType === "mock" ? 12 : 5,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSession(null);
        setSessionError(data.error || "Could not start verified practice.");
        if (data.availability) setAvailability(data.availability);
        return;
      }
      setSession(data.session);
      setSubmission(null);
      setAnswers({});
      setSavedItems({});
    } catch (error) {
      setSessionError(String(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function saveResponse(sessionItemId: string, answer: string) {
    if (!session) return;
    setSessionError("");
    try {
      const res = await authFetch("/api/exam-catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_response",
          sessionId: session.id,
          sessionItemId,
          answerText: answer,
          responsePayload: { answer },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Could not save this answer.");
      setSavedItems((previous) => ({ ...previous, [sessionItemId]: true }));
    } catch (error) {
      setSavedItems((previous) => ({ ...previous, [sessionItemId]: false }));
      setSessionError(error instanceof Error ? error.message : "Could not save this answer.");
    }
  }

  async function submitSession() {
    if (!session) return;
    setSubmitting(true);
    setSessionError("");
    try {
      const res = await authFetch("/api/exam-catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_session",
          sessionId: session.id,
          answers,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSessionError(data.error || "Could not submit this session.");
        return;
      }
      setSubmission(data.submission);
    } catch (error) {
      setSessionError(String(error));
    } finally {
      setSubmitting(false);
    }
  }

  const canCheck = Boolean(board && subject);
  const canStart = availability?.available === true;

  return (
    <>
      <Helmet>
        <title>Verified Practice | VertexEd</title>
        <meta
          name="description"
          content="Start verified practice only from administrator-approved, reviewed exam content. Unsupported subjects are shown honestly as unavailable."
        />
      </Helmet>

      <PageSection>
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-foreground">Verified practice workspace</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Only administrator-approved, reviewed assessment content appears here. If a subject is unavailable, VertexEd will say so instead of inventing a paper.
          </p>
        </div>
        <div className="mb-4">
          <Link to="/main" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <NeumorphicCard className="p-5">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2 text-sm">
                <span className="text-muted-foreground">Board</span>
                <select className="neu-input-el w-full" value={board} onChange={(e) => setBoard(e.target.value as ExamBoard)}>
                  {EXAM_BOARDS.map((value) => (
                    <option key={value} value={value}>
                      {BOARD_CONFIGS[value].label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm">
                <span className="text-muted-foreground">Level</span>
                <select
                  className="neu-input-el w-full"
                  value={grade ?? ""}
                  onChange={(e) => setGrade(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Select level</option>
                  {grades.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm">
                <span className="text-muted-foreground">Subject</span>
                <select className="neu-input-el w-full" value={subject} onChange={(e) => setSubject(e.target.value)}>
                  <option value="">Select subject</option>
                  {subjects.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
              <label className="space-y-2 text-sm">
                <span className="text-muted-foreground">Session</span>
                <select className="neu-input-el w-full" value={sessionType} onChange={(event) => setSessionType(event.target.value as typeof sessionType)}>
                  <option value="diagnostic">Diagnostic (5 questions)</option>
                  <option value="practice">Targeted practice (5 questions)</option>
                  <option value="mock">Timed mock set (up to 12 questions)</option>
                </select>
              </label>
              <button
                type="button"
                className="neu-button px-4 py-2 text-sm disabled:opacity-50"
                disabled={!canCheck || availabilityLoading}
                onClick={checkAvailability}
              >
                {availabilityLoading ? "Checking..." : "Check approved content"}
              </button>
              <button
                type="button"
                className="neu-button px-4 py-2 text-sm disabled:opacity-50"
                disabled={!canStart || submitting}
                onClick={startVerifiedPractice}
              >
                {submitting && !session ? "Starting..." : `Start ${sessionType === "mock" ? "verified mock" : "verified session"}`}
              </button>
            </div>

            {(availabilityError || sessionError) && (
              <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {availabilityError || sessionError}
              </div>
            )}

            {session && (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-border/60 bg-foreground/[0.03] p-4">
                  <p className="text-sm text-muted-foreground">
                    Session type: <span className="text-foreground">{session.sessionType}</span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Verified scoring only appears for deterministically scorable items. Other responses are accepted, but scores are withheld.
                  </p>
                </div>

                {session.items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-border/60 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Question {item.ordinal} · {item.externalReference}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-foreground">{item.questionText}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{item.marks} marks</span>
                    </div>
                    {item.questionType === "selected_response" && Array.isArray(item.questionPayload?.choices) && item.questionPayload.choices.length > 0 ? (
                      <fieldset className="mt-4 space-y-2" aria-label={`Answer options for question ${item.ordinal}`}>
                        {item.questionPayload.choices.map((choice) => (
                          <label key={choice} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/60 px-3 py-2 text-sm hover:border-primary/40">
                            <input
                              type="radio"
                              name={`question-${item.id}`}
                              value={choice}
                              checked={answers[item.id] === choice}
                              onChange={() => {
                                setAnswers((previous) => ({ ...previous, [item.id]: choice }));
                                void saveResponse(item.id, choice);
                              }}
                            />
                            {choice}
                          </label>
                        ))}
                      </fieldset>
                    ) : (
                      <textarea
                        className="neu-input-el mt-4 min-h-[140px] w-full"
                        placeholder="Write your answer here"
                        value={answers[item.id] ?? ""}
                        onChange={(e) => {
                          const answer = e.target.value;
                          setAnswers((previous) => ({ ...previous, [item.id]: answer }));
                          setSavedItems((previous) => ({ ...previous, [item.id]: false }));
                        }}
                        onBlur={(event) => void saveResponse(item.id, event.target.value)}
                      />
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">{savedItems[item.id] ? "Draft saved securely" : "Draft saves when you leave this answer"}</p>
                  </div>
                ))}

                <button type="button" className="neu-button px-4 py-2 text-sm disabled:opacity-50" disabled={submitting} onClick={submitSession}>
                  {submitting ? "Submitting..." : "Submit verified practice"}
                </button>
              </div>
            )}
          </NeumorphicCard>

          <div className="space-y-6">
            <NeumorphicCard className="p-5">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-base font-semibold text-foreground">Safety boundary</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This workspace never fabricates papers or official marks. It only serves reviewed catalogue questions and withholds unsupported grading.
                  </p>
                </div>
              </div>
            </NeumorphicCard>

            <NeumorphicCard className="p-5">
              <h2 className="text-base font-semibold text-foreground">Availability</h2>
              {!availability && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Choose a board and subject, then check whether approved content has been published.
                </p>
              )}
              {availability && (
                <div className="mt-3 space-y-3 text-sm">
                  <p className={availability.available ? "text-emerald-400" : "text-muted-foreground"}>
                    {availability.message}
                  </p>
                  <p className="text-muted-foreground">
                    Verified question count: <span className="text-foreground">{availability.questionCount}</span>
                  </p>
                  {!availability.available && (
                    <p className="text-muted-foreground">
                      If this subject is still pending, an administrator needs to approve source rights, parsing, mark schemes, and classifications before students can use it.
                    </p>
                  )}
                </div>
              )}
            </NeumorphicCard>

            {submission && (
              <NeumorphicCard className="p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-foreground">Submission results</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Verified score:{" "}
                      <span className="text-foreground">
                        {submission.verifiedMaxScore > 0
                          ? `${submission.verifiedScore}/${submission.verifiedMaxScore}`
                          : "Unavailable"}
                      </span>
                    </p>
                    <div className="mt-4 space-y-3">
                      {submission.results.map((result) => (
                        <div key={result.sessionItemId} className="rounded-xl border border-border/60 bg-foreground/[0.03] p-3">
                          <p className="text-sm text-foreground">
                            {result.score != null && result.maxScore != null
                              ? `Verified score: ${result.score}/${result.maxScore}`
                              : "Score withheld"}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">{result.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </NeumorphicCard>
            )}
          </div>
        </div>
      </PageSection>
    </>
  );
}
