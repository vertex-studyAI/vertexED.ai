import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { sanitizeMarkdown } from "@/lib/sanitize";

type Props = {
  children: string;
  className?: string;
};

export default function ChatMarkdown({ children, className }: Props) {
  const safe = sanitizeMarkdown(children || "");
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      className={className ?? "prose prose-sm prose-invert max-w-none"}
    >
      {safe || "…"}
    </ReactMarkdown>
  );
}
