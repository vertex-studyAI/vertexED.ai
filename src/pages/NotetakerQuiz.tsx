import { Helmet } from "react-helmet-async";
import NeumorphicCard from "@/components/NeumorphicCard";

export default function NotetakerQuiz() {
  return (
    <>
      <Helmet>
        <title>Vertex — AI Notetaker & Quiz</title>
        <meta name="description" content="Take notes, generate flashcards, and practice with quizzes in one place." />
        <link rel="canonical" href={typeof window!== 'undefined' ? window.location.href : '/notetaker'} />
      </Helmet>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <NeumorphicCard className="p-4">
            <h2 className="text-lg font-medium mb-3">Topic and format</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="neu-input"><input className="neu-input-el" placeholder="Topic" /></div>
              <div className="neu-input"><input className="neu-input-el" placeholder="Preferred format (notes/flashcards)" /></div>
            </div>
          </NeumorphicCard>

          <NeumorphicCard className="p-4">
            <h2 className="text-lg font-medium mb-3">Notes</h2>
            <div className="neu-textarea h-80">
              <textarea className="neu-input-el h-full" placeholder="Type or paste your notes here..." />
            </div>
          </NeumorphicCard>
        </div>

        <div className="space-y-6">
          <NeumorphicCard className="p-4">
            <h2 className="text-lg font-medium mb-3">Quiz type</h2>
            <div className="flex gap-3 flex-wrap">
              <button className="neu-button px-4 py-2">Quiz</button>
              <button className="neu-button px-4 py-2">MCQ</button>
              <button className="neu-button px-4 py-2">Typed</button>
            </div>
          </NeumorphicCard>

          <NeumorphicCard className="p-4">
            <h2 className="text-lg font-medium mb-3">Question</h2>
            <div className="neu-input"><input className="neu-input-el" placeholder="Generated question will appear here" /></div>
            <div className="mt-3 neu-input"><input className="neu-input-el" placeholder="Answer zone" /></div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="neu-button text-center py-2">Timer</div>
              <div className="neu-button text-center py-2">Score</div>
            </div>
          </NeumorphicCard>
        </div>
      </div>
    </>
  );
}
