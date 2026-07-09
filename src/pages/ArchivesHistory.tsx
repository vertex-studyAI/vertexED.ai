import ArchivesSubjectPage from "@/components/archives/ArchivesSubjectPage";

const TABS = ["Overview", "Timelines", "Source Analysis", "Model Responses"];

export default function ArchivesHistory() {
  return (
    <ArchivesSubjectPage
      title="History"
      slug="History"
      description="Timelines, source analysis, and model answers that show how strong arguments are built."
      tabs={TABS}
    />
  );
}
