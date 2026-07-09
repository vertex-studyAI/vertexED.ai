import ArchivesSubjectPage from "@/components/archives/ArchivesSubjectPage";

const TABS = ["Overview", "Close Readings", "Sample Essays", "Practice Questions"];

export default function ArchivesLnL() {
  return (
    <ArchivesSubjectPage
      title="Language & Literature"
      slug="LnL"
      description="Close readings, annotated excerpts, and exemplar essays to learn from."
      tabs={TABS}
    />
  );
}
