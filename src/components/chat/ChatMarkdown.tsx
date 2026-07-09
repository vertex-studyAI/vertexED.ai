import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

type Props = {
  children: string;
  className?: string;
};

export default function ChatMarkdown({ children, className }: Props) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      className={className ?? "prose prose-sm prose-invert max-w-none"}
    >
      {children || "…"}
    </ReactMarkdown>
  );
}
