import React from "react";
import { Helmet } from "react-helmet-async";

type HrefLang = { hrefLang: string; href: string };

export type SEOProps = {
  title: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  imageAlt?: string;
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
  keywords,
  canonical,
  image = DEFAULT_IMAGE,
  imageAlt = "VertexED study tools for students",
  ogType = "website",
  robots = "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  hreflang = [],
  jsonLd,
}: SEOProps) {
  const json = toJson(jsonLd);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="application-name" content={SITE_NAME} />
      <meta name="author" content={SITE_NAME} />
      <meta httpEquiv="content-language" content="en" />
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {robots && <meta name="robots" content={robots} />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      {image && <meta property="og:image:alt" content={imageAlt} />}
      {canonical && <meta property="og:url" content={canonical} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@VertexED_AI" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      {image && <meta name="twitter:image:alt" content={imageAlt} />}

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
