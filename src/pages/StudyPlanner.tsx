import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import NeumorphicCard from "@/components/NeumorphicCard";

export default function StudyPlanner() {
  return (
    <>
      <Helmet>
        <title>Vertex — Study Planner</title>
        <meta name="description" content="Organize your study plan and schedule." />
        <link rel="canonical" href={typeof window!== 'undefined' ? window.location.href : '/planner'} />
      </Helmet>
      <div className="mb-6">
        <Link to="/main" className="neu-button px-4 py-2 text-sm">← Back to Main</Link>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <NeumorphicCard className="p-8 h-96" title="Study Calendar" info="Plan sessions and track deadlines with intelligent scheduling.">
          <p className="opacity-70 text-lg">Interactive calendar with AI-powered study session planning, deadline tracking, and progress visualization coming soon.</p>
        </NeumorphicCard>
        <NeumorphicCard className="p-8 h-96" title="Upcoming Sessions" info="Your next tasks and deadlines at a glance.">
          <p className="opacity-70 text-lg">Smart dashboard showing your prioritized study sessions, upcoming deadlines, and recommended focus areas.</p>
        </NeumorphicCard>
      </div>
    </>
  );
}
