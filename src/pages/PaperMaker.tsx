import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import NeumorphicCard from "@/components/NeumorphicCard";
import PageSection from "@/components/PageSection";

export default function PaperMaker() {
  return (
    <>
      <Helmet>
  <title>IB/IGCSE Practice Paper Generator | Vertex</title>
  <meta name="description" content="Generate IB and IGCSE-style practice papers from your topics (UI placeholder)." />
  <link rel="canonical" href="https://vertex-ai-rho.vercel.app/paper-maker" />
  <meta property="og:title" content="IB/IGCSE Practice Paper Generator | Vertex" />
  <meta property="og:description" content="Create custom practice papers based on your syllabus." />
  <meta property="og:url" content="https://vertex-ai-rho.vercel.app/paper-maker" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="https://vertex-ai-rho.vercel.app/socialpreview.jpg" />
      </Helmet>

      <PageSection>
        <div className="mb-6">
          <Link to="/main" className="neu-button px-4 py-2 text-sm">← Back to Main</Link>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
        <NeumorphicCard className="p-8 min-h-96" title="Paper Configuration" info="Customize your IB/IGCSE practice paper with specific settings.">
          <div className="grid gap-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="neu-input">
                <select className="neu-input-el" aria-label="Board">
                  <option>International Baccalaureate (IB)</option>
                  <option>Cambridge IGCSE</option>
                </select>
              </div>
              <div className="neu-input">
                <select className="neu-input-el" aria-label="Level">
                  <option>Standard Level (SL)</option>
                  <option>Higher Level (HL)</option>
                  <option>Core Level</option>
                  <option>Extended Level</option>
                </select>
              </div>
            </div>
            <div className="neu-input">
              <input className="neu-input-el" placeholder="Subject (e.g., Mathematics, Physics, Chemistry)" aria-label="Subject" />
            </div>
            <div className="neu-input">
              <input className="neu-input-el" placeholder="Specific topics (comma separated, e.g., calculus, vectors, probability)" aria-label="Topics" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="neu-input">
                <input className="neu-input-el" type="number" min={1} max={50} placeholder="Number of Questions" aria-label="Number of questions" />
              </div>
              <div className="neu-input">
                <select className="neu-input-el" aria-label="Format">
                  <option>Mixed Format</option>
                  <option>Short Answer Only</option>
                  <option>Structured Questions</option>
                  <option>Essay Format</option>
                </select>
              </div>
            </div>
            <button className="neu-button py-4 text-lg font-medium">Generate Practice Paper</button>
          </div>
        </NeumorphicCard>

        <NeumorphicCard className="p-8 min-h-96" title="Paper Preview" info="Generated practice paper with official formatting and marking schemes.">
          <div className="neu-surface inset p-6 rounded-2xl h-full flex items-center justify-center">
            <div className="text-center">
              <p className="opacity-70 text-lg mb-4">Your custom IB/IGCSE practice paper will appear here</p>
              <p className="text-sm opacity-60">Complete with official formatting, marking schemes, and export options (PDF/Print)</p>
            </div>
          </div>
        </NeumorphicCard>
        </div>
      </PageSection>
    </>
  );
}
