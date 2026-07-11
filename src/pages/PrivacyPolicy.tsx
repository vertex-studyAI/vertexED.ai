import SEO from "@/components/SEO";
import PageSection from "@/components/PageSection";
import Article from "@/components/Article";

export default function PrivacyPolicy() {
  return (
    <>
      <SEO
        title="Privacy Policy — VertexED"
        description="How VertexED collects, uses, and protects your study data."
        canonical="https://www.vertexed.app/privacy"
      />
      <PageSection className="max-w-3xl mx-auto py-10">
        <Article>
          <h1>Privacy Policy</h1>
          <p><em>Last updated: July 11, 2026</em></p>

          <h2>Overview</h2>
          <p>
            VertexED (&ldquo;we&rdquo;, &ldquo;us&rdquo;) provides AI-assisted study tools for exam students.
            This policy explains what information we collect, how we use it, and the choices you have.
          </p>

          <h2>Information we collect</h2>
          <ul>
            <li><strong>Account data:</strong> email address, display name, and authentication metadata from Supabase Auth.</li>
            <li><strong>Study content:</strong> notes, planner tasks, saved reviews, mock papers, and notebook sources you choose to save.</li>
            <li><strong>Usage data:</strong> basic analytics (page views, performance) via Vercel Analytics when enabled.</li>
            <li><strong>AI prompts:</strong> questions and study content you submit to AI features are sent to our API providers (OpenAI, Google Gemini) to generate responses.</li>
          </ul>

          <h2>How we use information</h2>
          <ul>
            <li>Authenticate you and sync saved work across devices.</li>
            <li>Provide AI tutoring, grading, planning, and content generation features.</li>
            <li>Improve reliability, security, and product quality.</li>
            <li>Respond to support requests and enforce our terms.</li>
          </ul>

          <h2>Data storage &amp; retention</h2>
          <p>
            Account and cloud-saved artifacts are stored in Supabase (PostgreSQL) in regions configured for your project.
            Some features also cache data locally in your browser when cloud sync is unavailable.
            You may export account data from Settings and request account deletion at any time.
          </p>

          <h2>Third-party services</h2>
          <p>We use trusted processors including Supabase (auth/database), Vercel (hosting), OpenAI, and Google Gemini. Each processes data according to their own policies.</p>

          <h2>Your rights</h2>
          <p>
            You can access, export, or delete your account from User Settings. For other requests, contact{" "}
            <a href="mailto:privacy@vertexed.app">privacy@vertexed.app</a>.
          </p>

          <h2>Children</h2>
          <p>
            VertexED is designed for secondary and exam-prep students. If you are under 13, please use the service only with a parent or school&apos;s consent.
          </p>

          <h2>Changes</h2>
          <p>We may update this policy. Material changes will be reflected on this page with a new &ldquo;Last updated&rdquo; date.</p>
        </Article>
      </PageSection>
    </>
  );
}
