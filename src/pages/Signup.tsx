import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import PageSection from "@/components/PageSection";

export default function Signup() {
  const { signUp, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [studyGoal, setStudyGoal] = useState<string>("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [gradeLevel, setGradeLevel] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleSubject = (s: string) => {
    setSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (step === 1) {
      // Basic validation before moving to personalization
      if (!email.trim()) return setError("Please enter your email.");
      if (!password || password.length < 6) return setError("Password must be at least 6 characters.");
      const uname = username.trim();
      if (!uname) return setError("Please choose a username.");
      if (!/^([a-zA-Z0-9_\.\-]{3,20})$/.test(uname)) return setError("Username should be 3-20 characters (letters, numbers, _ . -).");
      setStep(2);
      return;
    }

    // Step 2: complete signup with metadata
    try {
      setLoading(true);
      const metadata: Record<string, any> = { username: username.trim() };
      // Only include preferences if user provided any
      const prefs: Record<string, any> = {};
      if (studyGoal) prefs.studyGoal = studyGoal;
      if (subjects.length) prefs.subjects = subjects;
      if (gradeLevel) prefs.gradeLevel = gradeLevel;
      if (Object.keys(prefs).length) metadata.preferences = prefs;

      const res = await signUp(email, password, metadata);
      if (res.needsConfirmation) {
        setInfo("Check your email to confirm your account.");
      } else {
        navigate("/main");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    // Create account without optional preferences
    try {
      setError(null);
      setInfo(null);
      setLoading(true);
      const res = await signUp(email, password, { username: username.trim() });
      if (res.needsConfirmation) {
        setInfo("Check your email to confirm your account.");
      } else {
        navigate("/main");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Vertex — Sign up</title>
        <meta name="description" content="Create your Vertex account to unlock the AI-powered study toolkit." />
        <link rel="canonical" href="https://www.vertexed.app/signup" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <PageSection className="relative min-h-[70vh] flex items-center justify-center overflow-hidden px-4">
        <form
          className="relative neu-card w-full max-w-md p-8 md:p-10 rounded-2xl border border-white/5 animate-fade-in"
          onSubmit={handleSubmit}
        >
          <h1 className="text-3xl font-semibold mb-2 text-center text-white">{step === 1 ? "Sign up" : "Personalize your experience"}</h1>
          <p className="text-center mb-6 text-sm opacity-80">
            {step === 1 ? "Create your account" : "Optional – this helps tailor study tips and content."}
          </p>

          {step === 1 && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await loginWithGoogle();
                  } catch (err) {
                    setError((err as Error).message);
                  }
                }}
                className="w-full neu-button py-3 flex items-center justify-center gap-2"
                aria-label="Continue with Google"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5" aria-hidden>
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.602 31.18 29.197 34 24 34c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.058 0 5.842 1.153 7.961 3.039l5.657-5.657C33.643 4.346 29.084 2 24 2 12.955 2 4 10.955 4 22s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/>
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.312 16.019 18.78 14 24 14c3.058 0 5.842 1.153 7.961 3.039l5.657-5.657C33.643 4.346 29.084 2 24 2 16.318 2 9.656 6.337 6.306 14.691z"/>
                  <path fill="#4CAF50" d="M24 42c5.138 0 9.642-1.977 12.999-5.184l-5.999-4.999C29.86 33.876 27.08 35 24 35c-5.174 0-9.571-3.291-11.15-7.889l-6.57 5.061C9.607 37.556 16.227 42 24 42z"/>
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.363 3.18-5.768 6-11.303 6-5.174 0-9.571-3.291-11.15-7.889l-6.57 5.061C9.607 37.556 16.227 42 24 42c8.822 0 16.245-5.987 18.611-14.083.563-1.953.889-4.028.889-6.083 0-1.341-.138-2.651-.389-3.917z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
              <div className="text-center text-xs opacity-60">or</div>

              <div className="neu-input">
                <input
                  aria-label="Email"
                  placeholder="Email"
                  className="neu-input-el"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                />
              </div>
              <div className="neu-input">
                <input
                  aria-label="Password"
                  placeholder="Password"
                  type="password"
                  className="neu-input-el"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="neu-input">
                <input
                  aria-label="Username"
                  placeholder="Choose a username"
                  className="neu-input-el"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <button className="w-full neu-button py-3 mt-2" disabled={loading}>Continue</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 opacity-80">What's your study goal?</label>
                <div className="neu-input">
                  <select
                    className="neu-input-el"
                    value={studyGoal}
                    onChange={(e) => setStudyGoal(e.target.value)}
                  >
                    <option value="">Select one (optional)</option>
                    <option value="ace_exams">Ace upcoming exams</option>
                    <option value="catch_up">Catch up on topics</option>
                    <option value="build_habits">Build study habits</option>
                    <option value="understand_better">Understand subjects better</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 opacity-80">Favorite subjects (optional)</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Math", "Science", "History", "Geography", "English", "Computer Science"].map((s) => (
                    <label key={s} className="flex items-center gap-2 neu-surface px-3 py-2 rounded-md cursor-pointer">
                      <input
                        type="checkbox"
                        checked={subjects.includes(s)}
                        onChange={() => toggleSubject(s)}
                      />
                      <span className="text-sm">{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 opacity-80">Grade level (optional)</label>
                <div className="neu-input">
                  <select
                    className="neu-input-el"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                  >
                    <option value="">Select (optional)</option>
                    <option value="middle_school">Middle School</option>
                    <option value="high_school">High School</option>
                    <option value="undergraduate">Undergraduate</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button type="button" onClick={handleSkip} className="w-full neu-button py-3 bg-white/5 hover:bg-white/10" disabled={loading}>
                  Skip for now
                </button>
                <button type="submit" className="w-full neu-button py-3" disabled={loading}>
                  Create account
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-center mt-4 text-sm text-red-500">{error}</p>
          )}
          {info && (
            <p className="text-center mt-4 text-sm text-emerald-500">{info}</p>
          )}
          <p className="text-center mt-4 text-sm opacity-80">
            Already have an account? <Link to="/login" className="sketch-underline">Log in</Link>
          </p>
        </form>
      </PageSection>
    </>
  );
}
