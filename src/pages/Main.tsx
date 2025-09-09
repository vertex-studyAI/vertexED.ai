import { Helmet } from "react-helmet-async";
import NeumorphicCard from "@/components/NeumorphicCard";
import { Link } from "react-router-dom";
import PageSection from "@/components/PageSection";

export default function Main() {
  const tiles = [
    { title: "Study Zone", to: "/study-zone", info: "All in 1 tool section for your calculators, activity logs and more." },
    { title: "AI Chatbot", to: "/chatbot", info: "Ask questions and get help on general topics or just simply have a discussion on academics." },
    { title: "Study Planner", to: "/planner", info: "Plan sessions and deadlines for your busy schedule in an instant." },
    { title: "Answer Reviewer", to: "/AnswerReviewer", info: "Not just a basic reviewer; a strict teacher of sorts which also gives the best feedback on how you can improve" },
    { title: "IB/IGCSE Paper Maker", to: "/paper-maker", info: "Create syllabus-aligned papers which are actually helpful." },
    { title: "Note taker + Flashcards + Quiz", to: "/notetaker", span: "md:row-span-2", info: "Notes to cards to quizzes all in 1 place for those late night revision sessions" },
  ];

  return (
    <>
      <Helmet>
  <title>Dashboard — Vertex AI Study Tools</title>
  <meta name="description" content="Your Vertex dashboard with quick access to all AI study tools." />
  <link rel="canonical" href="https://www.vertexed.app/main" />
  <meta name="robots" content="noindex, nofollow" />
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
