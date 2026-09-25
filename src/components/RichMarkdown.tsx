import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import MarkdownLink from "@/components/markdown/MarkdownLink";
import { enrichMathInText } from "@/lib/mathText";
import { sanitizeMarkdown } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

type Props = {
  children: string;
  className?: string;
  transformMath?: boolean;
};

export default function RichMarkdown({ children, className, transformMath = true }: Props) {
  // Match ChatMarkdown: sanitize before parse so HTML/plugin drift cannot bypass MarkdownLink.
  const markdown = sanitizeMarkdown(
    transformMath ? enrichMathInText(children || "") : children || "",
  );

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-li:text-foreground/90",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{ a: MarkdownLink }}
      >
        {markdown || "..."}
      </ReactMarkdown>
    </div>
  );
}
