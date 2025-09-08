import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import NeumorphicCard from "@/components/NeumorphicCard";
import PageSection from "@/components/PageSection";

export default function StudyZone() {
  return (
    <>
      <Helmet>
        <title>Best AI Study Tools — Focus Timer & Tasks | Vertex</title>
        <meta name="description" content="Use Vertex’s AI study tools to focus longer and get more done. Pomodoro timers, task planning, and productivity insights for students." />
  <link rel="canonical" href="https://www.vertexed.app/study-zone" />
        <meta property="og:title" content="Best AI Study Tools — Focus Timer & Tasks | Vertex" />
        <meta property="og:description" content="AI-powered focus timers and study task planning to boost productivity." />
  <meta property="og:url" content="https://www.vertexed.app/study-zone" />
        <meta property="og:type" content="website" />
  <meta property="og:image" content="https://www.vertexed.app/socialpreview.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Best AI Study Tools — Focus Timer & Tasks | Vertex" />
        <meta name="twitter:description" content="AI-powered focus timers and study task planning to boost productivity." />
  <meta name="twitter:image" content="https://www.vertexed.app/socialpreview.jpg" />
        <script type="application/ld+json">{`
        {
          "@context":"https://schema.org",
          "@type":"WebPage",
          "name":"AI Study Tools — Study Zone",
          "url":"https://www.vertexed.app/study-zone",
          "description":"AI-powered focus timers and task planning for students."
        }`}</script>
      </Helmet>
      <PageSection>
        <div className="mb-6">
          <Link to="/main" className="neu-button px-4 py-2 text-sm">← Back to Main</Link>
        </div>
        <h1 className="text-2xl font-semibold mb-4">AI Study Tools — Study Zone</h1>
        <div className="grid md:grid-cols-3 gap-6">
        <NeumorphicCard className="p-8 md:col-span-2 h-80">
          <h2 className="text-xl font-medium mb-4">Focus Timer</h2>
          <p className="opacity-70 text-lg">Advanced Pomodoro-style timers with customizable sessions, break intervals, and productivity tracking coming soon.</p>
        </NeumorphicCard>
        <NeumorphicCard className="p-8 h-80">
          <h2 className="text-xl font-medium mb-4">Study Tasks</h2>
          <p className="opacity-70 text-lg">Organize and prioritize your study tasks with AI-powered scheduling recommendations.</p>
        </NeumorphicCard>
        </div>
      </PageSection>
    </>
  );
}
