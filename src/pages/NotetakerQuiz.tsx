import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import NeumorphicCard from "@/components/NeumorphicCard";
import PageSection from "@/components/PageSection";

export default function NotetakerQuiz() {
  return (
    <>
      <Helmet>
        <title>Vertex — AI Notetaker & Quiz</title>
        <meta name="description" content="Take notes, generate flashcards, and practice with quizzes in one place." />
        <link rel="canonical" href={typeof window!== 'undefined' ? window.location.href : '/notetaker'} />
      </Helmet>

      <PageSection>
        <div className="mb-6">
          <Link to="/main" className="neu-button px-4 py-2 text-sm">← Back to Main</Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <NeumorphicCard className="p-8">
            <h2 className="text-xl font-medium mb-4">Topic and Format</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="neu-input"><input className="neu-input-el" placeholder="Enter your study topic..." /></div>
              <div className="neu-input">
                <select className="neu-input-el">
                  <option>Smart Notes</option>
                  <option>Flashcards</option>
                  <option>Study Guide</option>
                </select>
              </div>
            </div>
            <p className="text-sm opacity-70 mt-3">AI will help organize and format your content for optimal learning</p>
          </NeumorphicCard>

          <NeumorphicCard className="p-8">
            <h2 className="text-xl font-medium mb-4">Notes</h2>
            <div className="neu-textarea h-96">
              <textarea 
                className="neu-input-el h-full" 
                placeholder="Start typing your notes here... AI will help with organization, formatting, and key concept extraction as you write."
              />
            </div>
          </NeumorphicCard>
        </div>

        <div className="space-y-8">
          <NeumorphicCard className="p-8">
            <h2 className="text-xl font-medium mb-4">Quiz Type</h2>
            <div className="flex gap-3 flex-wrap mb-4">
              <button className="neu-button px-4 py-3">Interactive Quiz</button>
              <button className="neu-button px-4 py-3">Multiple Choice</button>
              <button className="neu-button px-4 py-3">Free Response</button>
            </div>
            <p className="text-sm opacity-70">Choose your preferred testing format for personalized learning</p>
          </NeumorphicCard>

          <NeumorphicCard className="p-8">
            <h2 className="text-xl font-medium mb-4">Generated Questions</h2>
            <div className="neu-surface inset p-4 rounded-2xl mb-4">
              <p className="text-sm opacity-70">AI-generated questions based on your notes will appear here</p>
            </div>
            <div className="neu-input mb-4">
              <input className="neu-input-el" placeholder="Your answer..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="neu-surface p-3 text-center rounded-xl">
                <p className="text-sm opacity-70">Timer</p>
                <p className="font-medium">--:--</p>
              </div>
              <div className="neu-surface p-3 text-center rounded-xl">
                <p className="text-sm opacity-70">Score</p>
                <p className="font-medium">--%</p>
              </div>
            </div>
          </NeumorphicCard>
          </div>
        </div>
      </PageSection>
    </>
  );
}