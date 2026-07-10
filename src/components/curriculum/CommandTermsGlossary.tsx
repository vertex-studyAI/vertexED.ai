import { useAuth } from '@/contexts/AuthContext';
import { getLearnerProfile } from '@/lib/learnerProfile';
import { getCommandTermsForBoard } from '@/lib/commandTerms';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  compact?: boolean;
};

export default function CommandTermsGlossary({ className, compact = false }: Props) {
  const { user } = useAuth();
  const board = getLearnerProfile(user).curriculum.board;
  const terms = getCommandTermsForBoard(board);

  return (
    <div className={cn('space-y-3', className)}>
      {!compact && (
        <p className="text-sm text-muted-foreground">
          {board
            ? 'Command terms used in your board\'s mark schemes — underline these in exam questions.'
            : 'Common exam command terms across curricula.'}
        </p>
      )}
      <div className={cn('grid gap-2', compact ? 'grid-cols-1' : 'sm:grid-cols-2')}>
        {terms.map(({ term, definition }) => (
          <div
            key={term}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <p className="font-medium text-primary text-sm">{term}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{definition}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
