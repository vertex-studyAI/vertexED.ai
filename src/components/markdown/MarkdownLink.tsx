import type { AnchorHTMLAttributes, ReactNode } from "react";
import { safeMarkdownHref } from "@/lib/markdownHref.mjs";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href?: string;
  children?: ReactNode;
};

/**
 * react-markdown link renderer that drops javascript:/data: and other
 * non-navigable schemes. DomPurify on raw markdown text does not catch
 * `[label](javascript:…)` because that form is not HTML.
 */
export default function MarkdownLink({ href, children, ...rest }: Props) {
  const safe = safeMarkdownHref(href);
  if (!safe) {
    return <span>{children}</span>;
  }
  const external = /^https?:/i.test(safe);
  return (
    <a
      {...rest}
      href={safe}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
