import { Helmet } from "react-helmet-async";
import NeumorphicCard from "@/components/NeumorphicCard";
import { Link } from "react-router-dom";

export default function Main() {
  const tiles = [
    { title: "Study Zone", to: "/study-zone" },
    { title: "AI Chatbot", to: "/chatbot" },
    { title: "Study Planner", to: "/planner" },
    { title: "Image Answer", to: "/image-answer" },
    { title: "Note taker + Flashcards + Quiz", to: "/notetaker", span: "md:row-span-2" },
  ];

  return (
    <>
      <Helmet>
        <title>Vertex — Main</title>
        <meta name="description" content="Your Vertex dashboard with quick access to all AI study tools." />
        <link rel="canonical" href={typeof window!== 'undefined' ? window.location.href : '/main'} />
      </Helmet>

      <div className="grid md:grid-cols-3 gap-6">
        {tiles.map((t) => (
          <Link to={t.to} key={t.title} className={t.span}>
            <NeumorphicCard className="p-6 h-full">
              <h3 className="text-xl font-medium mb-2">{t.title}</h3>
              <p className="opacity-70">Open {t.title.toLowerCase()} →</p>
            </NeumorphicCard>
          </Link>
        ))}
      </div>
    </>
  );
}
