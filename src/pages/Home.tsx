
import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  Sparkles,
  BookOpen,
  Trophy,
  Clock3,
  GraduationCap,
  LineChart,
  Shield,
  PlayCircle,
} from "lucide-react";

const features = [
  {
    title: "Adaptive Learning Paths",
    description:
      "Every student receives a dynamic learning journey based on strengths, weaknesses, pacing, and confidence levels.",
    icon: BrainCircuit,
  },
  {
    title: "Exam Simulation Engine",
    description:
      "Students can generate realistic timed papers, AI-reviewed answers, and revision diagnostics.",
    icon: Trophy,
  },
  {
    title: "Human-Centered Study Design",
    description:
      "Built to feel calm, premium, and focused instead of cluttered and robotic.",
    icon: Sparkles,
  },
  {
    title: "Deep Analytics",
    description:
      "Track mastery curves, retention patterns, productivity streaks, and revision efficiency.",
    icon: LineChart,
  },
];

const stats = [
  { value: "120K+", label: "Practice Questions" },
  { value: "48+", label: "Subjects Supported" },
  { value: "92%", label: "Retention Boost Target" },
  { value: "24/7", label: "Learning Access" },
];

export default function Home() {
  return (
    <main className="vertex-shell">
      <section className="hero">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-content"
        >
          <div className="hero-badge">
            <GraduationCap size={16} />
            VertexED.ai — Modern Education Infrastructure
          </div>

          <h1>
            The education platform students actually want to use.
          </h1>

          <p className="hero-text">
            VertexED combines adaptive learning, exam intelligence, analytics,
            revision workflows, productivity systems, and beautiful UX into one
            premium learning ecosystem. Designed for IB, IGCSE, AP, university,
            and independent learners.
          </p>

          <div className="hero-actions">
            <button className="primary-btn">
              Start Learning
              <ArrowRight size={18} />
            </button>

            <button className="secondary-btn">
              <PlayCircle size={18} />
              Watch Demo
            </button>
          </div>

          <div className="stats-grid">
            {stats.map((stat) => (
              <div className="stat-card" key={stat.label}>
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9 }}
          className="hero-panel"
        >
          <div className="panel-top">
            <span>Student Workspace</span>
            <Shield size={18} />
          </div>

          <div className="workspace-card">
            <Clock3 />
            <div>
              <h4>Today's Revision Focus</h4>
              <p>Organic Chemistry • Integration • Macbeth</p>
            </div>
          </div>

          <div className="workspace-card">
            <BookOpen />
            <div>
              <h4>AI Revision Recommendations</h4>
              <p>Target weak memory zones before Friday's assessment.</p>
            </div>
          </div>

          <div className="workspace-card">
            <BrainCircuit />
            <div>
              <h4>Adaptive Practice Running</h4>
              <p>Difficulty increases dynamically as mastery improves.</p>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="feature-section">
        <div className="section-heading">
          <span>Platform Features</span>
          <h2>Built like a real education startup.</h2>
          <p>
            Every interaction is designed to feel intentional, responsive, and
            deeply useful for students and educators.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <motion.div
                whileHover={{ y: -6 }}
                className="feature-card"
                key={feature.title}
              >
                <div className="feature-icon">
                  <Icon size={24} />
                </div>

                <h3>{feature.title}</h3>

                <p>{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-card">
          <span>Launch Ready</span>
          <h2>
            From prototype to polished startup platform.
          </h2>

          <p>
            This upgraded version pushes VertexED toward a production-grade
            education experience with stronger branding, cleaner UX, premium
            visual hierarchy, and scalable product architecture.
          </p>

          <button className="primary-btn">
            Explore Platform
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </main>
  );
}
