export type FounderProjectLink = {
  name: string;
  descriptor: string;
  href: string;
};

export type FounderProjectGroup = "organisations" | "bu1ld";

export type FounderProjectDirectoryEntry = FounderProjectLink & {
  group: FounderProjectGroup;
};

export const FOUNDER_PORTFOLIO_REVIEWED_ON = "11 October 2026";

export const FOUNDER_PROJECT_DESTINATIONS: FounderProjectLink[] = [
  {
    name: "The BU1LD",
    descriptor: "Machine-learning research and builder institution",
    href: "https://thebu1ld.com/",
  },
  {
    name: "FinanceMeta",
    descriptor: "Public finance research and education",
    href: "https://finance-meta-landing.vercel.app/",
  },
  {
    name: "Finance for All",
    descriptor: "Financial-literacy and member workspace",
    href: "https://finance4all-global-reach.vercel.app/",
  },
  {
    name: "IYERN",
    descriptor: "Youth economics research network",
    href: "https://iy-ern.vercel.app/",
  },
  {
    name: "Obscured Records",
    descriptor: "Long-form publication and research archive",
    href: "https://obscured-records-tawny.vercel.app/",
  },
  {
    name: "VertexED",
    descriptor: "Reachable product preview",
    href: "https://vertex-ed-ai.vercel.app/",
  },
];

export const BU1LD_PROJECT_PAGES: FounderProjectLink[] = [
  {
    name: "Counterfactual Defect Worlds",
    descriptor: "World-model robustness research",
    href: "https://thebu1ld.com/projects/counterfactual-defect-worlds",
  },
  {
    name: "Residual Event Tokenization",
    descriptor: "Continuous-stream representation research",
    href: "https://thebu1ld.com/projects/residual-event-tokenization",
  },
  {
    name: "NeuroCAD: Text to CAD",
    descriptor: "Engineering and computational-design startup",
    href: "https://thebu1ld.com/projects/neurocad",
  },
  {
    name: "AI Builder Cohort",
    descriptor: "Project-driven machine-learning programme",
    href: "https://thebu1ld.com/projects/ai-builder-cohort-q2",
  },
  {
    name: "PDE Surrogate Phase Transitions",
    descriptor: "Scientific machine-learning research",
    href: "https://thebu1ld.com/projects/pde-surrogate-phase-transitions",
  },
  {
    name: "OLYMPUS Cognitive Architecture",
    descriptor: "Model and inference research platform",
    href: "https://thebu1ld.com/projects/olympus-cognitive-architecture",
  },
  {
    name: "APEN: Episodic Predictive Memory",
    descriptor: "Memory for neural PDE surrogates",
    href: "https://thebu1ld.com/projects/apen-episodic-predictive-memory",
  },
  {
    name: "FIM: Fabric Inference Memory",
    descriptor: "Latent-memory research for dynamical prediction",
    href: "https://thebu1ld.com/projects/fabric-inference-memory",
  },
  {
    name: "RIPII",
    descriptor: "Invariant predictive-intelligence research",
    href: "https://thebu1ld.com/projects/ripii",
  },
  {
    name: "Spectral JEPA",
    descriptor: "Spectral representation-learning research",
    href: "https://thebu1ld.com/projects/spectral-jepa",
  },
  {
    name: "Quantized Adaptive Transformers",
    descriptor: "Efficient machine-learning research",
    href: "https://thebu1ld.com/projects/quantized-adaptive-transformers",
  },
  {
    name: "Mahjong",
    descriptor: "Decision-making and game-AI research",
    href: "https://thebu1ld.com/projects/mahjong",
  },
  {
    name: "BU1LD Open Research Forum",
    descriptor: "Working-paper and reproducibility programme",
    href: "https://thebu1ld.com/projects/open-research-forum",
  },
  {
    name: "Latent Safety and Recovery",
    descriptor: "Completed model-safety research thread",
    href: "https://thebu1ld.com/projects/latent-safety-recovery",
  },
];

export const FOUNDER_PROJECT_LINKS: FounderProjectDirectoryEntry[] = [
  ...FOUNDER_PROJECT_DESTINATIONS.map((project) => ({
    ...project,
    group: "organisations" as const,
  })),
  ...BU1LD_PROJECT_PAGES.map((project) => ({
    ...project,
    group: "bu1ld" as const,
  })),
];
