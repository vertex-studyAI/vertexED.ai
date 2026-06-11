import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FocusModeProvider } from "@/contexts/FocusModeContext";
import { AnalyticsRouterTracker } from "@/lib/analytics";
import { HelmetProvider } from "react-helmet-async";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import AppRouteFallback from "@/components/AppRouteFallback";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

const Home = lazy(() => import("@/pages/Home"));
const Features = lazy(() => import("@/pages/Features"));
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const Main = lazy(() => import("@/pages/Main"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const NotetakerQuiz = lazy(() => import("@/pages/NotetakerQuiz"));
const StudyZone = lazy(() => import("@/pages/study-zone/StudyZonePage"));
const AIChatbot = lazy(() => import("@/pages/AIChatbot"));
const StudyPlanner = lazy(() => import("@/pages/StudyPlanner"));
const AnswerReviewer = lazy(() => import("@/pages/AnswerReviewer"));
const About = lazy(() => import("@/pages/About"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const ExamHub = lazy(() => import("@/pages/ExamHub"));
const AnalyticsDashboard = lazy(() => import("@/pages/Analytics"));
const ArchivesHome = lazy(() => import("@/pages/ArchivesHome"));
const ArchivesLnL = lazy(() => import("@/pages/ArchivesLnL"));
const ArchivesHistory = lazy(() => import("@/pages/ArchivesHistory"));
const ArchivesGeography = lazy(() => import("@/pages/ArchivesGeography"));
const PaperMaker = lazy(() => import("@/pages/PaperMaker"));
const UserSettings = lazy(() => import("@/pages/UserSettings"));
const Brand = lazy(() => import("@/pages/Brand"));
const SiteLayout = lazy(() => import("@/components/layout/SiteLayout"));
const ResourcesIndex = lazy(() => import("@/pages/resources/Index"));
const AIStudyPlannerArticle = lazy(() => import("@/pages/resources/AIStudyPlanner"));
const PaperMakerGuide = lazy(() => import("@/pages/resources/PaperMakerGuide"));
const NotesToFlashcardsArticle = lazy(() => import("@/pages/resources/NotesToFlashcards"));
const AIAnswerReviewerArticle = lazy(() => import("@/pages/resources/AIAnswerReviewer"));
const StudyTechniquesActiveRecall = lazy(() => import("@/pages/resources/StudyTechniquesActiveRecall"));
const ExamStrategyTimeManagement = lazy(() => import("@/pages/resources/ExamStrategyTimeManagement"));
const SubjectGuidesCommonMistakes = lazy(() => import("@/pages/resources/SubjectGuidesCommonMistakes"));
const BestAIStudyTools2025 = lazy(() => import("@/pages/resources/BestAIStudyTools2025"));
const AutomatedNoteTakingGuide = lazy(() => import("@/pages/resources/AutomatedNoteTakingGuide"));
const HowToUseAIForStudying = lazy(() => import("@/pages/resources/HowToUseAIForStudying"));
const AIChatbotTutorGuide = lazy(() => import("@/pages/resources/AIChatbotTutorGuide"));
const IBMathGuide = lazy(() => import("@/pages/resources/IBMathGuide"));
const IGCSEScienceGuide = lazy(() => import("@/pages/resources/IGCSEScienceGuide"));
const EssayWritingGuide = lazy(() => import("@/pages/resources/EssayWritingGuide"));
const ALevelAPGuide = lazy(() => import("@/pages/resources/ALevelAPGuide"));
const IsUsingAICheating = lazy(() => import("@/pages/resources/IsUsingAICheating"));
const HowToCramEffectively = lazy(() => import("@/pages/resources/HowToCramEffectively"));
const IBTOKGuide = lazy(() => import("@/pages/resources/IBTOKGuide"));
const BestAIPromptsForStudents = lazy(() => import("@/pages/resources/BestAIPromptsForStudents"));
const AcademicBurnoutGuide = lazy(() => import("@/pages/resources/AcademicBurnoutGuide"));
const MemorizationTechniques = lazy(() => import("@/pages/resources/MemorizationTechniques"));
const CollegeEssaysWithAI = lazy(() => import("@/pages/resources/CollegeEssaysWithAI"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));


function App() {
  useEffect(() => {
    const isFinePointer = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(hover:hover) and (pointer:fine)').matches : true;
      const connection = (navigator as any).connection;
    const saveData = !!connection?.saveData;
      const slow = ['slow-2g','2g','3g'].includes(connection?.effectiveType || '');
    if (!isFinePointer || saveData || slow) return;

      const idle = (cb: () => void) => {
      return typeof requestIdleCallback !== 'undefined' ? requestIdleCallback(cb, { timeout: 3000 }) : setTimeout(cb, 1200);
    };
    const cancel = (id: any) => {
        return typeof cancelIdleCallback !== 'undefined' ? cancelIdleCallback(id) : clearTimeout(id);
    };

    const warm = () => {
        const start = () => {
        import("@/pages/Login");
          import("@/pages/Signup");
        import("@/pages/About");
          import("@/pages/Main");
        import("@/pages/StudyPlanner");
      };
      if (document.readyState === 'complete') start();
        else window.addEventListener('load', start, { once: true });
    };
    const id = idle(warm);
      return () => cancel(id);
  }, []);

  return (
    <HelmetProvider>
      <ThemeProvider>
        <FocusModeProvider>
          <AuthProvider>
            <BrowserRouter>
              <AppErrorBoundary>
                <AnalyticsRouterTracker />
                <SpeedInsights />
                <Analytics />
                <Suspense fallback={<AppRouteFallback />}>
                  <Routes>
                    <Route path="/" element={<SiteLayout />}>
                      <Route index element={<Home />} />
                      <Route path="home" element={<Navigate to="/" replace />} />

                        <Route path="resources" element={<ResourcesIndex />} />
                        <Route path="resources/ai-study-planner" element={<AIStudyPlannerArticle />} />
                        <Route path="resources/ib-igcse-paper-maker" element={<PaperMakerGuide />} />
                        <Route path="resources/notes-to-flashcards" element={<NotesToFlashcardsArticle />} />
                        <Route path="resources/ai-answer-reviewer" element={<AIAnswerReviewerArticle />} />
                        <Route path="resources/active-recall-spaced-repetition" element={<StudyTechniquesActiveRecall />} />
                        <Route path="resources/exam-strategy-time-management" element={<ExamStrategyTimeManagement />} />
                        <Route path="resources/subject-guides-common-mistakes" element={<SubjectGuidesCommonMistakes />} />
                        <Route path="resources/best-ai-study-tools-2025" element={<BestAIStudyTools2025 />} />
                        <Route path="resources/automated-note-taking-guide" element={<AutomatedNoteTakingGuide />} />
                        <Route path="resources/how-to-use-ai-for-studying" element={<HowToUseAIForStudying />} />
                        <Route path="resources/ai-chatbot-tutor" element={<AIChatbotTutorGuide />} />
                        <Route path="resources/ib-math-aa-ai-guide" element={<IBMathGuide />} />
                        <Route path="resources/igcse-science-revision" element={<IGCSEScienceGuide />} />
                        <Route path="resources/essay-writing-with-ai" element={<EssayWritingGuide />} />
                        <Route path="resources/alevel-ap-exam-prep" element={<ALevelAPGuide />} />
                        <Route path="resources/is-using-ai-cheating" element={<IsUsingAICheating />} />
                        <Route path="resources/how-to-cram-effectively" element={<HowToCramEffectively />} />
                        <Route path="resources/ib-tok-guide-ai" element={<IBTOKGuide />} />
                        <Route path="resources/best-ai-prompts-for-students" element={<BestAIPromptsForStudents />} />
                        <Route path="resources/academic-burnout-guide" element={<AcademicBurnoutGuide />} />
                        <Route path="resources/how-to-memorize-anything-fast" element={<MemorizationTechniques />} />
                      <Route path="resources/college-essays-with-ai" element={<CollegeEssaysWithAI />} />

                      <Route path="login" element={<Login />} />
                      <Route path="signup" element={<Signup />} />
                      <Route path="auth/callback" element={<AuthCallback />} />
                      <Route path="onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                      <Route path="main" element={<ProtectedRoute><Main /></ProtectedRoute>} />
                      <Route path="notetaker" element={<ProtectedRoute><NotetakerQuiz /></ProtectedRoute>} />
                        <Route path="study-zone" element={<ProtectedRoute><StudyZone /></ProtectedRoute>} />
                      <Route path="chatbot" element={<ProtectedRoute><AIChatbot /></ProtectedRoute>} />
                      <Route path="planner" element={<ProtectedRoute><StudyPlanner /></ProtectedRoute>} />
                        <Route path="answer-reviewer" element={<ProtectedRoute><AnswerReviewer /></ProtectedRoute>} />
                      <Route path="paper-maker" element={<ProtectedRoute><PaperMaker /></ProtectedRoute>} />

                      <Route path="archives" element={<ArchivesHome />} />
                        <Route path="archives-lnl" element={<ArchivesLnL />} />
                      <Route path="archives-history" element={<ArchivesHistory />} />
                        <Route path="archives-geography" element={<ArchivesGeography />} />

                      <Route path="about" element={<About />} />
                      <Route path="features" element={<Features />} />
                        <Route path="vertex-ed" element={<Brand />} />
                      <Route path="user-settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
                      <Route path="exam-hub" element={<ProtectedRoute><ExamHub /></ProtectedRoute>} />
                      <Route path="analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </Suspense>
              </AppErrorBoundary>
            </BrowserRouter>
          </AuthProvider>
        </FocusModeProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
