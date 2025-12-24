import React from "react";
import { Helmet } from "react-helmet-async";

type HrefLang = { hrefLang: string; href: string };

export type SEOProps = {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  ogType?: "website" | "article";
  robots?: string; // e.g., "index, follow"
  hreflang?: HrefLang[]; // e.g., [{ hrefLang: 'en', href: '...' }, { hrefLang: 'x-default', href: '...' }]
  jsonLd?: object | object[];
};

function toJson(content?: object | object[]) {
  try {
    return content ? JSON.stringify(content) : undefined;
  } catch (e) {
    return undefined;
  }
}

const DEFAULT_IMAGE = "https://www.vertexed.app/socialpreview.jpg";
const SITE_NAME = "VertexED";

export default function SEO({
  title,
  description,
  canonical,
  image = DEFAULT_IMAGE,
  ogType = "website",
  robots = "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  hreflang = [],
  jsonLd,
}: SEOProps) {
  const json = toJson(jsonLd);

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {robots && <meta name="robots" content={robots} />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      {canonical && <meta property="og:url" content={canonical} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@VertexED_AI" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* Hreflang */}
      {description && <meta property="og:description" content={description} />}
      {canonical && <meta property="og:url" content={canonical} />}
      {image && <meta property="og:image" content={image} />}      

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}

      {/* hreflang alternates */}
      {hreflang.map((alt) => (
        <link key={`${alt.hrefLang}-${alt.href}`} rel="alternate" hrefLang={alt.hrefLang} href={alt.href} />
      ))}

      {/* Optional JSON-LD */}
      {json && (
        <script type="application/ld+json">{json}</script>
      )}
    </Helmet>
  );
}
