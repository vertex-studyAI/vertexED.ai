import { useNavigate } from "react-router-dom";
import { ExternalLink, Trash2 } from "lucide-react";

import {
  artifactTargetRoute,
  deleteStudyArtifact,
  formatArtifactDate,
  queueArtifactRestore,
  type StudyArtifact,
  type StudyArtifactKind,
} from "@/lib/userContent";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Props = {
  items: StudyArtifact[];
  limit?: number;
  onChanged?: () => void;
  compact?: boolean;
  variant?: "default" | "dashboard";
};

export default function SavedWorkList({
  items,
  limit,
  onChanged,
  compact,
  variant = "default",
}: Props) {
  const navigate = useNavigate();
  const visible = limit ? items.slice(0, limit) : items;

  const openItem = (item: StudyArtifact) => {
    queueArtifactRestore(item);
    navigate(artifactTargetRoute(item.kind));
  };

  const removeItem = async (item: StudyArtifact) => {
    const label = item.title || item.kind;
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;

    const result = await deleteStudyArtifact(item.id);
    if (result.ok) {
      toast({ title: "Deleted", description: `${label} removed.` });
      onChanged?.();
    } else {
      toast({
        title: "Could not delete",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  if (!visible.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Generate notes, papers, or reviews — they&apos;ll appear here automatically.
      </p>
    );
  }

  return (
    <ul className={compact ? "space-y-2 text-sm" : "space-y-3 text-sm"}>
      {visible.map((item) => (
        <li
          key={item.id}
          className={cn(
            "surface-tile flex items-center gap-2",
            compact ? "px-3 py-2" : "px-4 py-3",
          )}
        >
          <div className="flex-1 min-w-0">
            <p className="truncate font-medium text-foreground">
              {item.title || item.kind}
            </p>
            <p className="text-xs mt-0.5 text-muted-foreground">
              <span className="capitalize">{item.kind}</span>
              {" · "}
              {formatArtifactDate(item.updated_at)}
              {item.localOnly && " · device"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => openItem(item)}
            className="neu-button px-2.5 py-1.5 text-xs inline-flex items-center gap-1 shrink-0"
            title="Open in tool"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open
          </button>
          <button
            type="button"
            onClick={() => void removeItem(item)}
            className="rounded-lg p-1.5 transition shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Delete ${item.title || item.kind}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}

export function ArtifactKindFilter({
  value,
  onChange,
}: {
  value: StudyArtifactKind | "all";
  onChange: (value: StudyArtifactKind | "all") => void;
}) {
  const options: Array<{ value: StudyArtifactKind | "all"; label: string }> = [
    { value: "all", label: "All" },
    { value: "note", label: "Notes" },
    { value: "paper", label: "Papers" },
    { value: "review", label: "Reviews" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filter saved work">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={cn(
            "rounded-full px-3 py-1 text-xs capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            value === opt.value
              ? "bg-primary/20 text-primary border border-primary/30"
              : "surface-chip text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
