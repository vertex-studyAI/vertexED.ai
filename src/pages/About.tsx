import { Helmet } from "react-helmet-async";

export default function About() {
  return (
    <>
      <Helmet>
        <title>Vertex — About</title>
        <meta name="description" content="About Vertex — a modern AI-powered study toolkit." />
        <link rel="canonical" href={typeof window!== 'undefined' ? window.location.href : '/about'} />
      </Helmet>
      <section className="prose prose-invert:prose-neutral max-w-3xl">
        <h1 className="text-3xl font-semibold mb-4">About Vertex</h1>
        <p className="opacity-90">Vertex brings all your study workflows into a single, delightful interface: notes, flashcards, quizzes, planner, chatbot, and more. This is a frontend-only preview — perfect for iterating on design and UX before connecting your backend.</p>
      </section>
    </>
  );
}
