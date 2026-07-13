import SEO from "@/components/SEO";
import PageSection from "@/components/PageSection";
import Article from "@/components/Article";
import { Link } from "react-router-dom";

export default function TermsOfService() {
  return (
    <>
      <SEO
        title="Terms of Service — VertexED"
        description="Terms governing use of VertexED study tools and AI features."
        canonical="https://www.vertexed.app/terms"
      />
      <PageSection className="max-w-3xl mx-auto py-10">
        <Article title="Terms of Service">
          <p><em>Last updated: July 11, 2026</em></p>

          <h2>Agreement</h2>
          <p>
            By accessing VertexED, you agree to these Terms and our{" "}
            <Link to="/privacy">Privacy Policy</Link>. If you do not agree, do not use the service.
          </p>

          <h2>Service description</h2>
          <p>
            VertexED offers study planning, AI tutoring, assistive answer feedback, note-taking, and—only where explicitly listed—authorized verified practice.
            AI outputs are assistive, and VertexED does not issue official board grades.
          </p>

          <h2>Accounts</h2>
          <ul>
            <li>You are responsible for keeping your login credentials secure.</li>
            <li>Signup may require a waitlist approval or invite code when enabled.</li>
            <li>We may suspend accounts that abuse the service or attempt to circumvent access controls.</li>
          </ul>

          <h2>Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Upload unlawful, harmful, or infringing content.</li>
            <li>Attempt to probe, scrape, or overload our APIs.</li>
            <li>Misrepresent AI-generated work as official grading or board certification.</li>
            <li>Share access credentials or resell the service without permission.</li>
          </ul>

          <h2>AI limitations</h2>
          <p>
            AI responses may be incomplete or incorrect. Always verify important facts, citations, and mark allocations with official resources.
          </p>

          <h2>Intellectual property</h2>
          <p>
            VertexED retains rights to the platform, branding, and original content. You retain rights to study materials you create; you grant us a limited license to process them to provide the service.
          </p>

          <h2>Termination</h2>
          <p>
            You may delete your account from User Settings. We may terminate or limit access for violations of these Terms or to protect the service.
          </p>

          <h2>Disclaimer</h2>
          <p>
            The service is provided &ldquo;as is&rdquo; without warranties. To the fullest extent permitted by law, VertexED is not liable for indirect or consequential damages arising from use of the platform.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these Terms: <a href="mailto:legal@vertexed.app">legal@vertexed.app</a>
          </p>
        </Article>
      </PageSection>
    </>
  );
}
