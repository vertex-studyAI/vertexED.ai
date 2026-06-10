import NotFound from "@/pages/NotFound";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

// "Exam Hub" — new feature surface. Per current launch plan it routes
// directly into the 404 page (spec: "on click return the new 404 page")
// while we build the real experience behind the scenes.
export default function ExamHub() {
  useEffect(() => {
    const openTs = Date.now();
    track("exam_hub_open");
    return () => {
      track("exam_hub_close", { dwell_ms: Date.now() - openTs });
    };
  }, []);
  return (
    <>
      <Helmet>
        <title>Exam Hub — Coming Soon | VertexED</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <NotFound />
    </>
  );
}
