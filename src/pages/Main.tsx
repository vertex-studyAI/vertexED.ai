import { Helmet } from "react-helmet-async";
import NeumorphicCard from "@/components/NeumorphicCard";
import { Link } from "react-router-dom";
import PageSection from "@/components/PageSection";

export default function Main() {
  const tiles = [
    { title: "Study Zone", to: "/study-zone", info: "Focused pomodoro and resources." },
    { title: "AI Chatbot", to: "/chatbot", info: "Ask questions and get help." },
    { title: "Study Planner", to: "/planner", info: "Plan sessions and deadlines." },
    { title: "Image Answer", to: "/image-answer", info: "Solve from photos of questions." },
    { title: "IB/IGCSE Paper Maker", to: "/paper-maker", info: "Create syllabus-aligned papers." },
    { title: "Note taker + Flashcards + Quiz", to: "/notetaker", span: "md:row-span-2", info: "Notes to cards to quizzes." },
  ];

  return (
    <>
      <Helmet>
        <title>Vertex — Main</title>
        <meta name="description" content="Your Vertex dashboard with quick access to all AI study tools." />
        <link rel="canonical" href={typeof window!== 'undefined' ? window.location.href : '/main'} />
      </Helmet>

      <PageSection>
        <div className="grid md:grid-cols-3 gap-6">
          {tiles.map((t) => (
            <Link to={t.to} key={t.title} className={t.span}>
              <NeumorphicCard className="p-8 h-full min-h-52" info={t.info} title={t.title}>
                <p className="opacity-70 text-lg">Open {t.title.toLowerCase()} →</p>
                <p className="text-sm opacity-60 mt-3">Access powerful AI tools designed to enhance your study experience and improve learning outcomes.</p>
              </NeumorphicCard>
            </Link>
          ))}
        </div>
      </PageSection>
    </>
  );
}
