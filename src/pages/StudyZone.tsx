import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import NeumorphicCard from "@/components/NeumorphicCard";

export default function StudyZone() {
  return (
    <>
      <Helmet>
        <title>Vertex — Study Zone</title>
        <meta name="description" content="Focused study zone with timers and task lists." />
        <link rel="canonical" href={typeof window!== 'undefined' ? window.location.href : '/study-zone'} />
      </Helmet>
        <div className="mb-6">
          <Link to="/main" className="neu-button px-4 py-2 text-sm">← Back to Main</Link>
        </div>
        
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
    </>
  );
}
