import { getApexPrompts } from '@/content/apex';
import type { StudyPageContext } from '@/lib/studyContext';

type Props = {
  context: StudyPageContext;
  onSelect: (text: string) => void;
  disabled?: boolean;
  compact?: boolean;
};

export default function ApexPromptChips({ context, onSelect, disabled, compact }: Props) {
  const prompts = getApexPrompts(context).slice(0, compact ? 3 : 4);

  return (
    <div className={`apex-prompt-chips ${compact ? 'apex-prompt-chips-compact' : ''}`}>
      {prompts.map((p) => (
        <button
          key={p.label}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(p.text)}
          className="apex-prompt-chip"
        >
          <span className="font-medium text-foreground/90">{p.label}</span>
          {!compact && (
            <span className="block text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{p.text}</span>
          )}
        </button>
      ))}
    </div>
  );
}
