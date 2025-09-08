import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import NeumorphicCard from "@/components/NeumorphicCard";
import PageSection from "@/components/PageSection";

export default function StudyPlanner() {
  return (
    <>
      <Helmet>
        <title>AI Study Planner & Calendar — Organize Your Study Plan | Vertex</title>
        <meta name="description" content="Plan study sessions, track deadlines, and optimize schedules with Vertex’s AI study planner and calendar." />
  <link rel="canonical" href="https://www.vertexed.app/planner" />
        <meta property="og:title" content="AI Study Planner & Calendar — Vertex" />
        <meta property="og:description" content="Plan sessions, track deadlines, and optimize your study schedule with AI." />
  <meta property="og:url" content="https://www.vertexed.app/planner" />
        <meta property="og:type" content="website" />
  <meta property="og:image" content="https://www.vertexed.app/socialpreview.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Study Planner & Calendar — Vertex" />
        <meta name="twitter:description" content="Plan sessions, track deadlines, and optimize your study schedule with AI." />
  <meta name="twitter:image" content="https://www.vertexed.app/socialpreview.jpg" />
        <script type="application/ld+json">{`
        {
          "@context":"https://schema.org",
          "@type":"WebPage",
          "name":"AI Study Planner",
          "url":"https://www.vertexed.app/planner",
          "description":"AI-powered study planner and calendar for students."
        }`}</script>
      </Helmet>
      <PageSection>
        <div className="mb-6">
          <Link to="/main" className="neu-button px-4 py-2 text-sm">← Back to Main</Link>
        </div>
        <h1 className="text-2xl font-semibold mb-4">AI Study Planner & Calendar</h1>
        <div className="grid md:grid-cols-2 gap-6">
        <NeumorphicCard className="p-8 h-96" title="Study Calendar" info="Plan sessions and track deadlines with intelligent scheduling.">
          <p className="opacity-70 text-lg">Interactive calendar with AI-powered study session planning, deadline tracking, and progress visualization coming soon.</p>
        </NeumorphicCard>
        <NeumorphicCard className="p-8 h-96" title="Upcoming Sessions" info="Your next tasks and deadlines at a glance.">
          <p className="opacity-70 text-lg">Smart dashboard showing your prioritized study sessions, upcoming deadlines, and recommended focus areas.</p>
        </NeumorphicCard>
        </div>
      </PageSection>
    </>
  );
}
