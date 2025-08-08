import { Helmet } from "react-helmet-async";
import NeumorphicCard from "@/components/NeumorphicCard";

export default function ImageAnswer() {
  return (
    <>
      <Helmet>
        <title>Vertex — Image Answer</title>
        <meta name="description" content="Upload an image of a question to get guided help (placeholder)." />
        <link rel="canonical" href={typeof window!== 'undefined' ? window.location.href : '/image-answer'} />
      </Helmet>
      <NeumorphicCard className="p-6">
        <div className="neu-input"><input className="neu-input-el" type="file" aria-label="Upload image" /></div>
        <p className="opacity-70 mt-3">Analysis preview will appear here.</p>
      </NeumorphicCard>
    </>
  );
}
