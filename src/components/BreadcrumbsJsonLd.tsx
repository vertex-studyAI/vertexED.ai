import React from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getHeadingsForPath } from "@/components/SemanticHeadings";

const BASE_URL = "https://www.vertexed.app";

function buildBreadcrumbList(pathname: string) {
  // Normalize and split
  const segments = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  const items: Array<{ name: string; item: string }> = [];

  // Root
  items.push({ name: "Home", item: `${BASE_URL}/` });

  // Build incremental paths to support deep routes
  let current = "";
  for (const seg of segments) {
    current += `/${seg}`;
    const title = getHeadingsForPath(current).title;
    items.push({ name: title, item: `${BASE_URL}${current}` });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((i, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: i.name,
      item: i.item,
    })),
  };
}

export default function BreadcrumbsJsonLd() {
  const { pathname } = useLocation();
  const data = buildBreadcrumbList(pathname || "/");
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}
