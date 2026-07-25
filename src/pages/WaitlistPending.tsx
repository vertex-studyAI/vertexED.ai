import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import PageSection from "@/components/PageSection";

export default function WaitlistPending() {
  return <>
    <Helmet><title>Waitlist request pending | VertexED</title><meta name="robots" content="noindex, nofollow" /></Helmet>
    <PageSection className="flex min-h-[60vh] items-center justify-center px-4">
      <section className="glass-panel w-full max-w-lg p-8 text-center">
        <p className="text-sm font-semibold text-primary">Private beta</p>
        <h1 className="mt-2 text-3xl font-semibold">Your Google request is pending</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">We will approve your request soon. Afterwards, simply sign in with the same Google account.</p>
        <Link to="/" className="btn-glass mt-6 inline-flex px-4 py-2 text-sm">Back home</Link>
      </section>
    </PageSection>
  </>;
}