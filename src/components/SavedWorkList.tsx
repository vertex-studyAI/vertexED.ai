import { useNavigate } from "react-router-dom";
import { ExternalLink, Trash2 } from "lucide-react";

import {
  artifactTargetRoute,
  deleteStudyArtifact,
  formatArtifactDate,
  queueArtifactRestore,
  type StudyArtifact,
} from "@/lib/userContent";
import { toast } from "@/hooks/use-toast";

type Props = {
  items: StudyArtifact[];
  limit?: number;
  onChanged?: () => void;
  compact?: boolean;
};

export default function SavedWorkList({ items, limit, onChanged, compact }: Props) {
  const navigate = useNavigate();
  const visible = limit ? items.slice(0, limit) : items;

  const openItem = (item: StudyArtifact) => {
    queueArtifactRestore(item);
    navigate(artifactTargetRoute(item.kind));
  };

  const removeItem = async (item: StudyArtifact) => {
    const result = await deleteStudyArtifact(item.id);
    if (result.ok) {
      toast({ title: "Deleted", description: item.title || "Saved work removed." });
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
          className={`flex items-center gap-2 border border-white/10 bg-white/5 rounded-lg ${
            compact ? "px-3 py-2" : "px-4 py-3"
          }`}
        >
          <div className="flex-1 min-w-0">
            <p className="text-foreground truncate font-medium">{item.title || item.kind}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
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
            className="rounded-lg p-1.5 text-muted-foreground hover:text-red-300 hover:bg-red-500/10 transition shrink-0"
            aria-label={`Delete ${item.title || item.kind}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}
