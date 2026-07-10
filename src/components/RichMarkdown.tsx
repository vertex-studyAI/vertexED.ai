import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { enrichMathInText } from '@/lib/mathText';
import { sanitizeMarkdown } from '@/lib/sanitize';
import { cn } from '@/lib/utils';

type Props = {
  children: string;
  className?: string;
};

export default function RichMarkdown({ children, className }: Props) {
  const safe = sanitizeMarkdown(enrichMathInText(children || ''));
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      className={cn(
        'prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-li:text-foreground/90',
        className,
      )}
    >
      {safe || '…'}
    </ReactMarkdown>
  );
}
