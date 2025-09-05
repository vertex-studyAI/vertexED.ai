import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import NeumorphicCard from "@/components/NeumorphicCard";
import PageSection from "@/components/PageSection";

export default function ImageAnswer() {
	return (
		<>
			<Helmet>
				<title>Image Answer — Solve from Photos | Vertex</title>
				<meta name="description" content="Upload a photo of a question and get step-by-step help. Coming soon." />
				<link rel="canonical" href="https://vertex-ai-rho.vercel.app/image-answer" />
				<meta property="og:title" content="Image Answer — Vertex" />
				<meta property="og:description" content="Solve questions from images with AI. Coming soon." />
				<meta property="og:url" content="https://vertex-ai-rho.vercel.app/image-answer" />
				<meta property="og:type" content="website" />
				<meta property="og:image" content="https://vertex-ai-rho.vercel.app/socialpreview.jpg" />
			</Helmet>

			<PageSection>
				<div className="mb-6">
					<Link to="/main" className="neu-button px-4 py-2 text-sm">← Back to Main</Link>
				</div>
				<h1 className="text-2xl font-semibold mb-4">Image Answer (Preview)</h1>
				<NeumorphicCard className="p-8 h-[70vh] flex items-center justify-center" info="Upload a photo of a question and get AI explanations and answers.">
					<p className="opacity-70 text-lg text-center">Image-based answering is coming soon. You'll be able to upload a photo or screenshot here.</p>
				</NeumorphicCard>
			</PageSection>
		</>
	);
}
