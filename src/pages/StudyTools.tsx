import { APP_ORIGIN } from '@/lib/appOrigin';
import { useEffect, useRef } from 'react';
import { Link, useLocation } from "react-router";
import {
  BookOpen,
  Brain,
  Clock,
  FileText,
  Sparkles,
  Target,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

import SEO from "@/components/SEO";
import PageSection from "@/components/PageSection";
import NeumorphicCard from "@/components/NeumorphicCard";
import FormulaDesk from "@/components/study/FormulaDesk";
import OfflineSettings from '@/components/OfflineSettings';
import CommandTermsGlossary from "@/components/curriculum/CommandTermsGlossary";
import { LEARNING_DESIGN_COMMITMENTS, STUDY_LOOP_STAGES } from '@/content/learningFoundations';
import '@/styles/study-tools-hub.css';

const TECHNIQUES = [
  { title: "Active recall", desc: "Close the explanation and reconstruct the idea first. The difficulty of retrieval is information about what needs another pass.", to: "/resources/active-recall-spaced-repetition" },
  { title: "Spaced practice", desc: "Return after a delay instead of repeating everything at once. Rate the attempt so the next review has a reason and a date.", to: "/notetaker" },
  { title: "Timed focus", desc: "Set one concrete output for a bounded block, then take a real break. The timer supports the task; it is not the task itself.", to: "/study-zone" },
  { title: "Explanation check", desc: "Explain the mechanism in plain language, define each term and test the explanation with a counterexample or follow-up question.", to: "/chatbot" },
  { title: "Mixed practice", desc: "Combine question forms so you must select the method rather than copy the last example. Check each response against trusted material.", to: "/paper-maker" },
  { title: "Answer review", desc: "Trace feedback to the exact line or missing relationship, then attempt a focused retry. Verify any mark you plan to record.", to: "/answer-reviewer" },
];

const EXAM_CHECKLIST = [
  "Read the paper instructions and allocate time in proportion to marks",
  "Reserve checking time appropriate to the paper length; check units and significant figures",
  "Underline command terms: explain, evaluate, justify, discuss",
  "For essays: plan the argument, support it with evidence and answer the question in your conclusion",
  "After practice, review one answer and schedule a retry for the gap you found",
];

const QUICK_TOOLS = [
  { title: "Planner", intent: 'Make time to study', desc: 'Reserve a study block or add a commitment.', to: "/planner", icon: Sparkles },
  { title: "Study Zone", intent: 'Start a focus session', desc: 'Use a timer, calculator and study breaks.', to: "/study-zone", icon: Clock },
  { title: "AI Notes", intent: 'Practise from your notes', desc: 'Turn your material into flashcards and quizzes.', to: "/notetaker", icon: FileText },
  { title: "Paper Maker", intent: 'Attempt a practice paper', desc: 'Generate extra practice for your topic.', to: "/paper-maker", icon: BookOpen },
  { title: "Answer Reviewer", intent: 'Review an answer', desc: 'Compare AI feedback with your course material.', to: "/answer-reviewer", icon: CheckCircle2 },
  { title: "Exam Prep", intent: 'Prepare for an exam', desc: 'Choose an exam target and your next session.', to: "/exam-prep", icon: Target },
];
const SECTIONS = [
  ['tools', 'Choose a tool'], ['cycle', 'Study cycle'], ['formulas', 'Formulas'], ['methods', 'Study methods'],
  ['checklist', 'Exam checklist'], ['terms', 'Command terms'], ['offline', 'Offline study'],
];

export default function StudyTools() {
  const location = useLocation();
  const initialLocation = useRef(location);
  useEffect(() => {
    const initial = initialLocation.current;
    const params = new URLSearchParams(initial.search);
    const section = SECTIONS.find(([id]) => initial.hash === `#study-tools-${id}`);
    const target = section ? `study-tools-${section[0]}`
      : !initial.hash && ['formula', 'subject', 'fq'].some(key => params.has(key)) ? 'study-tools-formulas' : null;
    if (!target) return;
    // Wait for the route's normal scroll reset, then honour an incoming
    // reference link. Search edits and practice drafts never trigger this.
    let secondFrame = 0;
    const frame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({ block: 'start', behavior: 'instant' }));
    });
    return () => { window.cancelAnimationFrame(frame); window.cancelAnimationFrame(secondFrame); };
  }, []);
  return (
    <>
      <SEO
        title="Study Tools & Formula Reference | VertexED"
        description="Choose study tools and browse available references. Materials awaiting subject review are labelled."
        canonical={`${APP_ORIGIN}/study-tools`}
      />

      <PageSection className="max-w-5xl study-tools-hub">
        <div className="mb-8">
          <span className="block text-xs uppercase tracking-widest text-primary/80">Your revision desk</span>
          <h1 className="text-3xl md:text-4xl font-semibold mt-2">
            Study Tools & Resources
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
            Choose your next study task. References, methods and command terms are available only after subject review.
          </p>
        </div>

        <nav className="study-tools-jumps" aria-label="Study tools sections">
          {SECTIONS.map(([id, label]) => <a key={id} href={`#study-tools-${id}`} onClick={() => document.getElementById(`study-tools-${id}`)?.focus({ preventScroll: true })}>{label}</a>)}
        </nav>
        <section id="study-tools-tools" tabIndex={-1} className="study-tools-section study-tools-directory" aria-labelledby="study-tools-directory-title">
          <div className="study-tools-section-heading"><h2 id="study-tools-directory-title">What’s your next task?</h2><p>Choose a tool for the work you want to do.</p></div>
          <div className="study-tools-grid">
          {QUICK_TOOLS.map((tool) => (
            <Link key={tool.to} to={tool.to} className="study-tools-choice">
              <div className="study-tools-choice-top"><tool.icon aria-hidden="true" size={20} /><ArrowUpRight aria-hidden="true" size={18} /></div>
              <p className="study-tools-intent">{tool.intent}</p><h3>{tool.title}</h3><p>{tool.desc}</p>
            </Link>
          ))}
          </div>
        </section>

        <section id="study-tools-cycle" tabIndex={-1} className="study-tools-section study-tools-cycle" aria-labelledby="study-tools-cycle-title">
          <div className="study-tools-section-heading">
            <h2 id="study-tools-cycle-title">Choose the tool by the learning job.</h2>
            <p>A productive session moves through a sequence. It does not need every tool, but each tool should have a clear job.</p>
          </div>
          <ol>
            {STUDY_LOOP_STAGES.map((item, index) => (
              <li key={item.id}>
                <span>{String(index + 1).padStart(2, '0')} / {item.label}</span>
                <h3>{item.heading}</h3>
                <p>{item.summary}</p>
                <strong>{item.question}</strong>
                <Link to={item.href}>Open {item.label.toLowerCase()} tools <ArrowUpRight aria-hidden /></Link>
              </li>
            ))}
          </ol>
          <div className="study-tools-commitments">
            {LEARNING_DESIGN_COMMITMENTS.map((item) => <div key={item.title}><h3>{item.title}</h3><p>{item.copy}</p></div>)}
          </div>
        </section>

        <div id="study-tools-formulas" tabIndex={-1} className="study-tools-section"><FormulaDesk /></div>

        <div id="study-tools-methods" tabIndex={-1} className="study-tools-section">
        <NeumorphicCard className="p-6 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Study Techniques</h2>
          </div>
          {!TECHNIQUES.length && <p className="text-sm text-muted-foreground">Study methods are awaiting subject review.</p>}
          <div className="grid md:grid-cols-2 gap-4">
            {TECHNIQUES.map((t) => (
              <Link
                key={t.title}
                to={t.to}
                className="rounded-xl border border-border/60 bg-foreground/[0.04] p-4 hover:bg-foreground/[0.07] transition"
              >
                <h3 className="font-medium text-foreground">{t.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
              </Link>
            ))}
          </div>
        </NeumorphicCard>
        </div>

        <div id="study-tools-checklist" tabIndex={-1} className="study-tools-section">
        <NeumorphicCard className="p-6 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Exam Day Checklist</h2>
          </div>
          {!EXAM_CHECKLIST.length && <p className="text-sm text-muted-foreground">The exam checklist is awaiting subject review.</p>}
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            {EXAM_CHECKLIST.map((item) => (
              <li key={item} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ol>
        </NeumorphicCard>
        </div>

        <div id="study-tools-terms" tabIndex={-1} className="study-tools-section">
        <NeumorphicCard className="p-6 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Command terms glossary</h2>
          </div>
          <CommandTermsGlossary />
        </NeumorphicCard>
        </div>
        <div id="study-tools-offline" tabIndex={-1} className="study-tools-section mb-8"><OfflineSettings /></div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">Want deeper guides?</p>
          <Link to="/resources" className="btn-glass px-6 py-2.5 text-sm">
            Browse all resources →
          </Link>
        </div>
      </PageSection>
    </>
  );
}
