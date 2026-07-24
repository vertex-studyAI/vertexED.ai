import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { enrichMathInText } from "@/lib/mathText";
import { cn } from "@/lib/utils";

type Props = {
  children: string;
  className?: string;
  transformMath?: boolean;
};

export default function RichMarkdown({ children, className, transformMath = true }: Props) {
  // react-markdown does not render raw HTML unless rehypeRaw is explicitly added.
  // Keep the source as Markdown so structures and guide text are not altered before parsing.
  const markdown = transformMath ? enrichMathInText(children || "") : children || "";

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      className={cn(
        "prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-li:text-foreground/90",
        className,
      )}
    >
      {markdown || "..."}
    </ReactMarkdown>
  );
}