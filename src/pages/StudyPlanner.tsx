import { Helmet } from "react-helmet-async";
import PlannerView from "@/features/study-calendar/PlannerView";

export default function StudyPlanner() {
  return (
    <>
      <Helmet>
        <title>AI Study Planner & Calendar — Vertex</title>
        <meta name="description" content="Plan study sessions, track deadlines, and optimize schedules with Vertex’s AI study planner and calendar." />
        <link rel="canonical" href="https://www.vertexed.app/planner" />
      </Helmet>
      <PlannerView />
    </>
  );
}
