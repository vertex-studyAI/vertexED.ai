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
        <Article title="Privacy Policy">
          <p><em>Last updated: 6 September 2026</em></p>

          <h2>Overview</h2>
          <p>
            VertexED is a private-beta study application. This policy describes the information the current product
            handles, when it leaves your browser, and the controls available in your account.
          </p>

          <h2>Information we collect</h2>
          <ul>
            <li><strong>Account and profile data:</strong> email address, display name, sign-in provider, board, year, subjects, exam date, study goal, and response preferences.</li>
            <li><strong>Study content:</strong> planner tasks, notes, flashcards, quizzes, notebook sources, generated papers, answers, reviews, and items you choose to save.</li>
            <li><strong>Learner-state data:</strong> due cards, verified weak-topic records, retries, unfinished mock drafts, weekly-loop activity, habits, and other progress signals used to continue your workflow.</li>
            <li><strong>Files and recordings:</strong> text, audio, and answer photos you submit for transcription, generation, or review. These are sent only when you use the relevant feature.</li>
            <li><strong>Operational data:</strong> page and performance analytics, route-level errors, request outcome, model/provider name, status code, and duration. Our own telemetry format excludes prompts, answers, email addresses, and account identifiers.</li>
          </ul>

          <h2>How we use information</h2>
          <ul>
            <li>Authenticate your account, apply beta access rules, and sync supported saved work.</li>
            <li>Provide planning, tutoring, transcription, practice generation, answer review, and retrieval features you request.</li>
            <li>Personalize the next-task suggestions from your profile and saved study signals.</li>
            <li>Diagnose failures, enforce rate limits, protect the service, and measure product reliability.</li>
            <li>Respond to support requests and enforce our terms.</li>
          </ul>

          <h2>Where information is stored</h2>
          <p>
            Authentication, profile data, supported study artifacts, and durable learner state are stored through Supabase.
            Some working data remains in your browser: session handoffs, quick notes, habits, draft state, exam-prep choices,
            and generated board-guide caches. Device storage is scoped to the signed-in account, but it does not automatically
            appear on another device unless that data type supports cloud sync.
          </p>

          <h2>AI processing</h2>
          <p>
            When you run an AI feature, the material needed for that request is sent from VertexED&apos;s server to the configured
            provider. OpenAI is used for several tutoring, notes, paper, transcription, and review flows. Google Gemini is used
            for planner and study-guide features where configured. Do not submit information you are not allowed to share.
            Generated output can be incomplete or wrong, and board-specific details are not treated as official.
          </p>

          <h2>Retention and deletion</h2>
          <p>
            Account data and cloud-saved learner content are kept while the account is active. Deleting an account from Settings
            revokes refresh sessions, deletes the authentication identity, and triggers deletion of account-owned profile,
            waitlist, artifact, and learner-state rows. Minimal operational records that do not contain your study text or account
            identity may remain for security and reliability analysis. Infrastructure backups and subprocessors may retain data
            for their own limited backup or security periods.
          </p>
          <p>
            Account deletion cannot erase copies you exported or browser data left on another device. Clear this site&apos;s storage
            on each device you no longer control. If deletion fails, the account remains intact and Settings tells you to try again.
          </p>

          <h2>Third-party services</h2>
          <p>
            The current product uses Supabase for authentication and database services, Vercel for hosting and product analytics,
            OpenAI for configured AI and transcription requests, and Google Gemini for configured generation requests. These
            companies process data under their own terms and privacy commitments. Provider choice can vary by feature and configuration.
          </p>

          <h2>Your rights</h2>
          <p>
            User Settings lets you download a combined export of server-held account data and account-scoped data on the current
            device. You can also delete your account there. Depending on where you live, you may have additional rights to access,
            correct, restrict, object to, or obtain a copy of personal data. For a request that Settings cannot handle, contact{" "}
            <a href="mailto:privacy@vertexed.app">privacy@vertexed.app</a>.
          </p>

          <h2>Children</h2>
          <p>
            VertexED is intended for exam-prep learners and is not knowingly offered directly to children under 13. If local law
            requires parent, guardian, or school authorization for your age, use VertexED only after that authorization is in place.
            A parent or guardian who believes a child provided personal data without appropriate permission can contact us to request removal.
          </p>

          <h2>Security</h2>
          <p>
            We use authenticated APIs, account-scoped database rules, request-size checks, rate limits, and restricted telemetry.
            No online service can promise absolute security. Protect your sign-in method and report suspected unauthorized access promptly.
          </p>

          <h2>Changes</h2>
          <p>We may update this policy. Material changes will be reflected on this page with a new &ldquo;Last updated&rdquo; date.</p>
        </Article>
      </PageSection>
    </>
  );
}
