import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import PageSection from "@/components/PageSection";
import { supabase } from "@/lib/supabaseClient";

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [studyGoal, setStudyGoal] = useState<string>("");
  const [gradeLevel, setGradeLevel] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user already has username, go to main
    const u = user;
    if (u?.user_metadata?.username) {
      navigate("/main", { replace: true });
    }
  }, [user, navigate]);

  const save = async (withPreferences: boolean) => {
    setError(null);
    const uname = username.trim();
    if (!uname) return setError("Please choose a username.");
    if (!/^([a-zA-Z0-9_\.\-]{3,20})$/.test(uname)) return setError("Username should be 3-20 characters (letters, numbers, _ . -).");

    try {
      setLoading(true);
      if (!supabase) throw new Error("Auth is disabled: Supabase not configured.");
      const metadata: Record<string, any> = { username: uname };
      if (withPreferences) {
        const prefs: Record<string, any> = {};
        if (studyGoal) prefs.studyGoal = studyGoal;
        if (gradeLevel) prefs.gradeLevel = gradeLevel;
        if (Object.keys(prefs).length) metadata.preferences = prefs;
      }
      const { error: updErr } = await supabase.auth.updateUser({ data: metadata });
      if (updErr) throw updErr;
      navigate("/main", { replace: true });
    } catch (e: any) {
      setError(e.message || "Could not save. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Welcome — Let’s personalize</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <PageSection className="relative min-h-[70vh] flex items-center justify-center overflow-hidden px-4">
        <div className="relative neu-card w-full max-w-md p-8 md:p-10 rounded-2xl border border-white/5 animate-fade-in">
          <h1 className="text-3xl font-semibold mb-2 text-center text-white">Choose a username</h1>
          <p className="text-center mb-6 text-sm opacity-80">We’ll also offer a couple of optional questions to tailor your experience.</p>

          <div className="space-y-4">
            <div className="neu-input">
              <input
                aria-label="Username"
                placeholder="Pick a username"
                className="neu-input-el"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <details className="neu-surface rounded-md p-4">
              <summary className="cursor-pointer select-none text-sm opacity-80">Optional: A couple of preferences</summary>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm mb-2 opacity-80">What's your study goal?</label>
                  <div className="neu-input">
                    <select className="neu-input-el" value={studyGoal} onChange={(e) => setStudyGoal(e.target.value)}>
                      <option value="">Select one (optional)</option>
                      <option value="ace_exams">Ace upcoming exams</option>
                      <option value="catch_up">Catch up on topics</option>
                      <option value="build_habits">Build study habits</option>
                      <option value="understand_better">Understand subjects better</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-2 opacity-80">Grade level (optional)</label>
                  <div className="neu-input">
                    <select className="neu-input-el" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}>
                      <option value="">Select (optional)</option>
                      <option value="middle_school">Middle School</option>
                      <option value="high_school">High School</option>
                      <option value="undergraduate">Undergraduate</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </details>

            {error && <p className="text-center text-sm text-red-500">{error}</p>}

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                type="button"
                onClick={() => save(false)}
                className="w-full neu-button py-3 bg-white/5 hover:bg-white/10"
                disabled={loading}
              >
                Skip personalization
              </button>
              <button type="button" onClick={() => save(true)} className="w-full neu-button py-3" disabled={loading}>
                Save and continue
              </button>
            </div>
          </div>
        </div>
      </PageSection>
    </>
  );
}
