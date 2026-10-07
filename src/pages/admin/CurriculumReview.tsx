import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import PageSection from '@/components/PageSection';
import PrivateReviewMarkdown from '@/components/curriculum/PrivateReviewMarkdown';
import SEO from '@/components/SEO';
import { authFetch } from '@/lib/apiAuth';

type Resource = {
  id: string;
  path: string;
  sha256: string;
  kind: 'text' | 'structured-text' | 'pdf' | 'image' | 'document' | 'download';
  mimeType: string;
};

type Packet = {
  key: string;
  curriculum: { board: string; subject: string; level: string; language: string };
  lesson: {
    id: string;
    title: string;
    topic: string;
    explanation: string;
    review: {
      editorialStatus: string;
      publicationStatus: string;
      teacherApproved: boolean;
      productionImportPerformed: boolean;
      requiredActions: string[];
    };
  };
  resources: Resource[];
  preferredResourceId: string | null;
};

type ReviewIndex = {
  state: string;
  digest: string;
  counts: {
    packets: number;
    records: number;
    lessons: number;
    workedExamples: number;
    questions: number;
    teacherApproved: number;
    runtimeExportRecords: number;
    productionImported: number;
  };
  packets: Packet[];
};

export default function CurriculumReview() {
  const [index, setIndex] = useState<ReviewIndex | null>(null);
  const [selectedPacketKey, setSelectedPacketKey] = useState('');
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [content, setContent] = useState<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resourceRequestRef = useRef(0);

  const packet = useMemo(
    () => index?.packets.find((item) => item.key === selectedPacketKey) || null,
    [index, selectedPacketKey],
  );
  const resource = packet?.resources.find((item) => item.id === selectedResourceId) || null;
  const structuredContent = useMemo(() => {
    if (resource?.kind !== 'structured-text' || content === null) return null;
    try {
      const value = JSON.parse(content);
      if (Array.isArray(value?.paragraphs) && value.paragraphs.every((item: unknown) => typeof item === 'string')) {
        return value.paragraphs.join('\n\n');
      }
    } catch {
      // The verified original remains available below when it is not a paragraph export.
    }
    return null;
  }, [content, resource?.kind]);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response = await authFetch('/api/curriculum-review?action=list');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Private review index could not be loaded.');
        if (!active) return;
        setIndex(data);
        const first = data.packets?.[0];
        setSelectedPacketKey(first?.key || '');
        setSelectedResourceId(first?.preferredResourceId || '');
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : 'Private review index could not be loaded.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!packet || !selectedResourceId) return;
    const requestId = ++resourceRequestRef.current;
    let nextObjectUrl: string | null = null;
    setResourceLoading(true);
    setError(null);
    setContent(null);
    setObjectUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return null;
    });

    void (async () => {
      try {
        const query = new URLSearchParams({ action: 'resource', packet: packet.key, resource: selectedResourceId });
        const response = await authFetch(`/api/curriculum-review?${query.toString()}`);
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Private lesson resource could not be loaded.');
        }
        if (requestId !== resourceRequestRef.current) return;
        const type = response.headers.get('content-type') || '';
        if (type.startsWith('text/') || type.startsWith('application/json')) {
          const nextContent = await response.text();
          if (requestId !== resourceRequestRef.current) return;
          setContent(nextContent);
        } else {
          const nextBlob = await response.blob();
          if (requestId !== resourceRequestRef.current) return;
          nextObjectUrl = URL.createObjectURL(nextBlob);
          setObjectUrl(nextObjectUrl);
        }
      } catch (reason) {
        if (requestId === resourceRequestRef.current) {
          setError(reason instanceof Error ? reason.message : 'Private lesson resource could not be loaded.');
        }
      } finally {
        if (requestId === resourceRequestRef.current) setResourceLoading(false);
      }
    })();

    return () => {
      resourceRequestRef.current += 1;
      if (nextObjectUrl) URL.revokeObjectURL(nextObjectUrl);
    };
  }, [packet, selectedResourceId]);

  const selectPacket = (next: Packet) => {
    setSelectedPacketKey(next.key);
    setSelectedResourceId(next.preferredResourceId || next.resources[0]?.id || '');
  };

  return (
    <>
      <SEO
        title="Private curriculum review | VertexED"
        description="Authenticated, read-only review of held VertexED curriculum packets."
        robots="noindex, nofollow"
      />
      <PageSection className="mx-auto max-w-7xl px-4 py-10">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-primary/25 pb-6">
          <div className="max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Private review</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Curriculum source desk</h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Read the retained lessons and inspect their held review state. This surface cannot approve, publish, export or import content.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/waitlist" className="neu-button px-4 py-2 text-sm">Waitlist admin</Link>
            <Link to="/main" className="neu-button px-4 py-2 text-sm">Back to Today</Link>
          </div>
        </header>

        {loading && <p className="text-muted-foreground">Loading the private review index…</p>}
        {error && <div role="alert" className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

        {index && (
          <>
            <section aria-label="Review status" className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Held packets', index.counts.packets],
                ['Private records', index.counts.records],
                ['Teacher approvals', index.counts.teacherApproved],
                ['Production imports', index.counts.productionImported],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                  <p className="mt-2 text-2xl font-semibold">{value}</p>
                </div>
              ))}
            </section>

            <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
              <nav aria-label="Held lesson packets" className="rounded-xl border border-border bg-card p-3">
                <p className="px-2 pb-3 text-xs uppercase tracking-wide text-muted-foreground">Lessons</p>
                <div className="space-y-2">
                  {index.packets.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => selectPacket(item)}
                      aria-current={item.key === selectedPacketKey ? 'page' : undefined}
                      className={`w-full rounded-lg border px-3 py-3 text-left text-sm transition-colors ${
                        item.key === selectedPacketKey
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                      }`}
                    >
                      <span className="block font-medium">{item.lesson.title}</span>
                      <span className="mt-1 block text-xs">{item.curriculum.subject} · {item.curriculum.level}</span>
                    </button>
                  ))}
                </div>
              </nav>

              {packet && (
                <main className="min-w-0 rounded-xl border border-border bg-card p-4 md:p-6">
                  <div className="mb-6 border-b border-border pb-5">
                    <p className="font-mono text-xs text-muted-foreground">{packet.lesson.id}</p>
                    <h2 className="mt-2 text-2xl font-semibold">{packet.lesson.title}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{packet.lesson.explanation}</p>
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <div><dt className="text-muted-foreground">Editorial state</dt><dd className="font-medium">{packet.lesson.review.editorialStatus}</dd></div>
                      <div><dt className="text-muted-foreground">Publication state</dt><dd className="font-medium">{packet.lesson.review.publicationStatus}</dd></div>
                      <div><dt className="text-muted-foreground">Teacher approved</dt><dd className="font-medium">No</dd></div>
                      <div><dt className="text-muted-foreground">Production import</dt><dd className="font-medium">Not performed</dd></div>
                    </dl>
                  </div>

                  <label htmlFor="curriculum-resource" className="mb-2 block text-sm font-medium">Retained source resource</label>
                  <select
                    id="curriculum-resource"
                    value={selectedResourceId}
                    onChange={(event) => setSelectedResourceId(event.target.value)}
                    className="mb-5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    {packet.resources.map((item) => <option key={item.id} value={item.id}>{item.id}</option>)}
                  </select>

                  {resourceLoading && <p className="text-sm text-muted-foreground">Verifying and loading the retained source…</p>}
                  {!resourceLoading && resource?.kind === 'text' && content !== null && (
                    <article className="rounded-xl border border-primary/20 bg-background p-4 md:p-6">
                      <PrivateReviewMarkdown packet={packet} sourcePath={resource.path}>{content}</PrivateReviewMarkdown>
                    </article>
                  )}
                  {!resourceLoading && resource?.kind === 'structured-text' && structuredContent !== null && (
                    <article className="rounded-xl border border-primary/20 bg-background p-4 md:p-6">
                      <PrivateReviewMarkdown packet={packet} sourcePath={resource.path}>{structuredContent}</PrivateReviewMarkdown>
                    </article>
                  )}
                  {!resourceLoading && resource?.kind === 'structured-text' && structuredContent === null && content !== null && (
                    <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-background p-4 text-xs leading-relaxed">{content}</pre>
                  )}
                  {!resourceLoading && resource?.kind === 'pdf' && objectUrl && (
                    <iframe title={`${packet.lesson.title} source`} src={objectUrl} className="h-[72vh] w-full rounded-xl border border-border bg-white" />
                  )}
                  {!resourceLoading && resource?.kind === 'image' && objectUrl && (
                    <img src={objectUrl} alt={`${packet.lesson.title} retained source`} className="max-h-[72vh] w-auto rounded-xl border border-border bg-white" />
                  )}
                  {!resourceLoading && resource?.kind === 'document' && objectUrl && (
                    <div className="rounded-xl border border-border bg-background p-5">
                      <p className="text-sm text-muted-foreground">This retained DOCX is available only as the hash-verified original file.</p>
                      <a href={objectUrl} download={resource.id} className="mt-3 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Download verified DOCX</a>
                    </div>
                  )}
                  {!resourceLoading && resource?.kind === 'download' && objectUrl && (
                    <div className="rounded-xl border border-border bg-background p-5">
                      <p className="text-sm text-muted-foreground">This retained source is available as its hash-verified original file.</p>
                      <a href={objectUrl} download={resource.id} className="mt-3 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Download verified source</a>
                    </div>
                  )}
                  {resource && <p className="mt-4 break-all font-mono text-xs text-muted-foreground">SHA-256 {resource.sha256}</p>}
                </main>
              )}
            </div>
          </>
        )}
      </PageSection>
    </>
  );
}
