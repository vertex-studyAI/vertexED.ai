import { Link } from 'react-router';
import { Helmet } from 'react-helmet-async';

export default function ContentReviewNotice({ title, page = false, id, headingId }: { title: string; page?: boolean; id?: string; headingId?: string }) {
  const Heading = page ? 'h1' : 'h2';
  return <section id={id} className="mx-auto w-full max-w-4xl px-6 py-12" aria-label={`${title} review status`}>
    {page && <Helmet><title>{title} | VertexED</title><meta name="robots" content="noindex,follow" /><meta name="description" content="This study resource is awaiting subject review and is not available yet." /></Helmet>}
    <p className="text-sm text-primary">Awaiting subject review</p>
    <Heading id={headingId} className="mt-2 text-2xl font-semibold text-foreground">{title}</Heading>
    <p className="mt-4 text-muted-foreground">This material is not available until its content, sources and permissions have been reviewed. Use your teacher’s approved materials for current study.</p>
    <Link to="/resources" className="mt-6 inline-flex text-primary underline underline-offset-4">Browse the learning library</Link>
  </section>;
}
