import { Helmet } from "react-helmet-async";
import NeumorphicCard from "@/components/NeumorphicCard";

export default function StudyZone() {
  return (
    <>
      <Helmet>
        <title>Vertex — Study Zone</title>
        <meta name="description" content="Focused study zone with timers and task lists." />
        <link rel="canonical" href={typeof window!== 'undefined' ? window.location.href : '/study-zone'} />
      </Helmet>
      <div className="grid md:grid-cols-3 gap-6">
        <NeumorphicCard className="p-6 md:col-span-2 h-64">
          <h2 className="text-lg font-medium mb-2">Timer</h2>
          <p className="opacity-70">Pomodoro-style timers coming soon.</p>
        </NeumorphicCard>
        <NeumorphicCard className="p-6 h-64">
          <h2 className="text-lg font-medium mb-2">Tasks</h2>
          <p className="opacity-70">Plan your study tasks here.</p>
        </NeumorphicCard>
      </div>
    </>
  );
}
