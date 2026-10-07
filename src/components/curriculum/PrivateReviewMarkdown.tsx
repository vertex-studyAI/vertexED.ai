import { useEffect, useMemo, useState } from 'react';
import type { Components } from 'react-markdown';
import RichMarkdown from '@/components/RichMarkdown';
import { authFetch } from '@/lib/apiAuth';
import { createRequestDeadline } from '@/lib/apiRequestRecovery.mjs';
import { resolveReviewImage, reviewResourceUrl } from '@/lib/curriculumReviewResources.mjs';

type Resource = { id: string; path: string; kind: string; sha256: string; mimeType: string };
type Packet = { key: string; resources: Resource[] };

type ImageProps = { packet: Packet; sourcePath: string; src?: string; alt?: string; title?: string };
function PrivateReviewImage({ packet, sourcePath, src, alt, title }: ImageProps) {
  const resource = resolveReviewImage(packet.resources, sourcePath, src) as Resource | null;
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resource) return;
    const controller = new AbortController();
    const deadline = createRequestDeadline(controller.signal, 30_000);
    let active = true;
    let retainedUrl: string | null = null;
    setError(null);
    setObjectUrl(null);
    void (async () => {
      try {
        const response = await authFetch(reviewResourceUrl(packet.key, resource.id), { signal: deadline.signal });
        if (!response.ok) throw new Error('Retained diagram could not be loaded.');
        if (response.headers.get('x-content-sha256') !== resource.sha256
          || response.headers.get('content-type')?.split(';')[0] !== resource.mimeType.split(';')[0]) {
          throw new Error('Retained diagram did not match its verified source.');
        }
        const blob = await response.blob();
        if (!active) return;
        retainedUrl = URL.createObjectURL(blob);
        setObjectUrl(retainedUrl);
      } catch (reason) {
        if (active) setError(deadline.didTimeout()
          ? 'Retained diagram took too long to load.'
          : reason instanceof Error ? reason.message : 'Retained diagram could not be loaded.');
      } finally {
        deadline.cleanup();
      }
    })();
    return () => {
      active = false;
      controller.abort();
      deadline.cleanup();
      if (retainedUrl) URL.revokeObjectURL(retainedUrl);
    };
  }, [packet.key, resource]);

  const failure = !resource ? 'This diagram is not a retained image in the selected packet.' : error;
  if (failure) return <span role="alert" className="block rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-foreground">{failure}{alt ? ` ${alt}` : ''}</span>;
  if (!objectUrl) return <span role="status" className="block text-sm text-muted-foreground">Verifying the retained diagram…</span>;
  return (
    <span className="block">
      <img src={objectUrl} alt={alt || 'Retained lesson diagram'} title={title} className="h-auto max-w-full rounded-lg border border-border bg-white" />
      <a href={objectUrl} download={resource.id} className="mt-2 inline-flex rounded-md border border-primary/30 px-3 py-2 text-sm font-medium text-primary">
        Download original diagram
      </a>
    </span>
  );
}

export default function PrivateReviewMarkdown({ packet, sourcePath, children }: { packet: Packet; sourcePath: string; children: string }) {
  const imageRenderer = useMemo<Components['img']>(() => function ReviewImage({ src, alt, title }) {
    return <PrivateReviewImage packet={packet} sourcePath={sourcePath} src={src} alt={alt} title={title} />;
  }, [packet, sourcePath]);
  return <RichMarkdown imageRenderer={imageRenderer}>{children}</RichMarkdown>;
}
