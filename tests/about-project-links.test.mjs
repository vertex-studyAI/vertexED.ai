import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const aboutSource = await readFile(new URL('../src/pages/About.tsx', import.meta.url), 'utf8');
const portfolioSource = await readFile(new URL('../src/content/founderPortfolio.ts', import.meta.url), 'utf8');
const projectsSource = await readFile(new URL('../src/pages/Projects.tsx', import.meta.url), 'utf8');
const appSource = await readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
const searchIndexSource = await readFile(new URL('../src/lib/globalSearchIndex.ts', import.meta.url), 'utf8');
const siteLayoutSource = await readFile(new URL('../src/components/layout/SiteLayout.tsx', import.meta.url), 'utf8');
const sitemapSource = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const linkAuditSource = await readFile(new URL('../scripts/audit-founder-project-links.mjs', import.meta.url), 'utf8');

test('Ryan founder profile links every named project to its public webpage', () => {
  const expectedProjects = [
    ['the BU1LD', 'https://thebu1ld.com/'],
    ['Finance4all', 'https://finance4all-global-reach.vercel.app/'],
    ['Obscured Records', 'https://obscured-records-tawny.vercel.app/'],
  ];

  for (const [name, url] of expectedProjects) {
    assert.ok(
      aboutSource.includes(`<a href="${url}" {...projectLinkProps}>${name}</a>`),
      `${name} should link to ${url}`,
    );
  }

  assert.match(aboutSource, /target: "_blank"/);
  assert.match(aboutSource, /rel: "noopener noreferrer"/);
});

test('founder portfolio exposes every verified public destination and BU1LD project page', () => {
  const requiredDestinations = [
    'https://finance-meta-landing.vercel.app/',
    'https://finance4all-global-reach.vercel.app/',
    'https://iy-ern.vercel.app/',
    'https://vertex-ed-ai.vercel.app/',
    'https://thebu1ld.com/projects/neurocad',
    'https://thebu1ld.com/projects/olympus-cognitive-architecture',
    'https://thebu1ld.com/projects/apen-episodic-predictive-memory',
    'https://thebu1ld.com/projects/fabric-inference-memory',
    'https://thebu1ld.com/projects/ripii',
    'https://thebu1ld.com/projects/latent-safety-recovery',
  ];

  for (const url of requiredDestinations) {
    assert.ok(portfolioSource.includes(`href: "${url}"`), `missing project webpage: ${url}`);
  }

  assert.equal((portfolioSource.match(/href: "https:\/\//g) ?? []).length, 20);
  assert.match(aboutSource, /FOUNDER_PROJECT_DESTINATIONS\.map/);
  assert.match(aboutSource, /Browse all \{BU1LD_PROJECT_PAGES\.length\} project pages/);
});

test('project directory is routed, searchable, filterable and indexed', () => {
  assert.match(portfolioSource, /FOUNDER_PROJECT_LINKS/);
  assert.match(projectsSource, /type="search"/);
  assert.match(projectsSource, /aria-pressed=/);
  assert.match(projectsSource, /aria-live="polite"/);
  assert.match(projectsSource, /useSearchParams/);
  assert.match(projectsSource, /displayDestination/);
  assert.match(projectsSource, /value="az"/);
  assert.match(projectsSource, /visibleProjects\.map/);
  assert.match(projectsSource, /A link is a route, not a result\./);
  assert.match(aboutSource, /to="\/projects"/);
  assert.match(appSource, /path="projects" element={<Projects \/>}/);
  assert.match(searchIndexSource, /to: '\/projects'/);
  assert.match(siteLayoutSource, /to: "\/projects", label: "Projects"/);
  assert.match(siteLayoutSource, /<Link to="\/projects"[^>]*>Projects<\/Link>/);
  assert.match(sitemapSource, /https:\/\/www\.vertexed\.app\/projects/);
  assert.match(linkAuditSource, /Expected 20 founder project URLs/);
});
