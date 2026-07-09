import ArchivesSubjectPage from "@/components/archives/ArchivesSubjectPage";

const TABS = ["Overview", "Case Studies", "Maps & Diagrams", "Practice Questions"];

export default function ArchivesGeography() {
  return (
    <ArchivesSubjectPage
      title="Geography"
      slug="Geography"
      description="Case studies, maps, and explanations that make geography click."
      tabs={TABS}
    />
  );
}
