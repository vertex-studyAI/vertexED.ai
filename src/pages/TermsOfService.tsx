import SEO from "@/components/SEO";
import PageSection from "@/components/PageSection";
import Article from "@/components/Article";
import { Link } from "react-router";

export default function TermsOfService() {
  return (
    <>
      <SEO
        title="Terms of Service - VertexED"
        description="Terms governing use of VertexED study tools and AI features."
        canonical="https://www.vertexed.app/terms"
      />
      <PageSection className="max-w-3xl mx-auto py-10">
        <Article title="Terms of Service">
          <p><em>Last updated: 6 September 2026</em></p>

          <h2>Agreement</h2>
          <p>
            These terms apply to the VertexED private beta. By creating an account or using the service, you agree to these
            terms and our <Link to="/privacy">Privacy Policy</Link>. If you cannot agree, do not use VertexED.
          </p>

          <h2>Service description</h2>
          <p>
            VertexED provides planning, focus, notes, retrieval, AI tutoring, generated practice papers, answer feedback, and exam-prep workflows.
            It is an independent study product and is not affiliated with, endorsed by, or certified by an exam board.
          </p>

          <h2>Eligibility and school rules</h2>
          <p>
            You must be able to enter this agreement under the law that applies to you. If you need permission from a parent,
            guardian, or school, obtain it before using the service. You are responsible for following your school&apos;s assessment,
            acceptable-use, and academic-integrity rules.
          </p>

          <h2>Accounts</h2>
          <ul>
            <li>You are responsible for keeping your login credentials secure.</li>
            <li>Signup may require a waitlist approval or invite code when enabled.</li>
            <li>Provide accurate account information and do not create an account for someone else without permission.</li>
            <li>We may suspend accounts that abuse the service or attempt to circumvent access controls.</li>
          </ul>

          <h2>Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Upload unlawful, harmful, or infringing content.</li>
            <li>Attempt to probe, scrape, or overload our APIs.</li>
            <li>Misrepresent AI-generated work as official grading or board certification.</li>
            <li>Use VertexED to cheat in a live, closed-book, or otherwise restricted assessment.</li>
            <li>Submit another person&apos;s private information or copyrighted material without permission.</li>
            <li>Share access credentials or resell the service without permission.</li>
          </ul>

          <h2>AI limitations</h2>
          <p>
            AI responses, generated papers, guide drafts, answer feedback, citations, and mark allocations may be incomplete,
            outdated, or wrong. A score remains provisional unless you confirm it against a teacher, an official mark scheme,
            or another trusted answer key. VertexED does not predict exam results or guarantee improvement.
          </p>

          <h2>Your content</h2>
          <p>
            You retain any rights you hold in material you submit. You give VertexED a limited permission to host, copy, transmit,
            and process that material only as needed to operate, secure, and support the service. You confirm that you have the right
            to submit it. You can export supported account data and delete your account from Settings.
          </p>

          <h2>Intellectual property</h2>
          <p>
            VertexED retains rights in the application, branding, and original product material. Exam-board names and third-party
            materials belong to their respective owners. Generated output may contain mistakes or material similar to other public text;
            review it before relying on or publishing it.
          </p>

          <h2>Beta availability</h2>
          <p>
            The beta may change, lose data, experience provider outages, or stop operating. We may add, remove, or limit features
            and may impose fair-use or rate limits. Export important work and keep your own copy of material needed for an assessment.
          </p>

          <h2>Termination</h2>
          <p>
            You may delete your account from User Settings. We may suspend or terminate access for violations, security risk,
            legal requirements, or discontinuation of the beta. Where practical, we will give notice for reasons unrelated to abuse or security.
          </p>

          <h2>Disclaimer</h2>
          <p>
            To the extent permitted by applicable law, the beta is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; VertexED
            does not warrant uninterrupted access, accurate AI output, syllabus completeness, or a particular academic outcome.
            Nothing in these terms excludes a right or liability that the law does not allow us to exclude.
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
