// File: /src/App.tsx
import SiteLayout from "@/components/layout/SiteLayout";
import AuthLandingRedirect from "@/components/AuthLandingRedirect";
import { lazy, Suspense } from "react";
// Keep the reporting UI with the app shell. A failed optional import used to
// cache an unavailable placeholder until the learner reloaded their work.
import FeedbackLauncher from "@/components/FeedbackLauncher";
// Background warming and telemetry may fail without disabling a learner control.
const OptionalAppEnhancements = lazy(() => import("@/components/OptionalAppEnhancements").catch(() => ({
  default: () => null,
})));
const Features = lazy(() => import("@/pages/Features"));
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const WaitlistPending = lazy(() => import("@/pages/WaitlistPending"));
const ConnectGoogle = lazy(() => import("@/pages/ConnectGoogle"));
const LearningWorkspace = lazy(() => import("@/pages/LearningWorkspace"));
const Main = lazy(() => import("@/pages/Main"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const NotetakerQuiz = lazy(() => import("@/pages/NotetakerQuiz"));
const StudyZone = lazy(() => import("@/pages/study-zone/StudyZonePage"));
const AIChatbot = lazy(() => import("@/pages/AIChatbot"));
const StudyPlanner = lazy(() => import("@/pages/StudyPlanner"));
const AnswerReviewer = lazy(() => import("@/pages/AnswerReviewer"));
const About = lazy(() => import("@/pages/About"));
const Projects = lazy(() => import("@/pages/Projects"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const ArchivesHome = lazy(() => import("@/pages/ArchivesHome"));
const ArchivesLnL = lazy(() => import("@/pages/ArchivesLnL"));
const ArchivesHistory = lazy(() => import("@/pages/ArchivesHistory"));
const ArchivesGeography = lazy(() => import("@/pages/ArchivesGeography"));
const PaperMaker = lazy(() => import("@/pages/PaperMaker"));
const UserSettings = lazy(() => import("@/pages/UserSettings"));
const Brand = lazy(() => import("@/pages/Brand"));
const StudyTools = lazy(() => import("@/pages/StudyTools"));
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
const IBMYPHumanitiesGuide = lazy(() => import("@/pages/resources/IBMYPHumanitiesGuide"));
const BestAIPromptsForStudents = lazy(() => import("@/pages/resources/BestAIPromptsForStudents"));
const AcademicBurnoutGuide = lazy(() => import("@/pages/resources/AcademicBurnoutGuide"));
const MemorizationTechniques = lazy(() => import("@/pages/resources/MemorizationTechniques"));
const CollegeEssaysWithAI = lazy(() => import("@/pages/resources/CollegeEssaysWithAI"));
const CurriculumFeature = lazy(() => import("@/pages/CurriculumFeature"));
const CurriculumToolsIndex = lazy(() => import("@/pages/CurriculumToolsIndex"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const StudyNotebook = lazy(() => import("@/pages/StudyNotebook"));
const ResourceLibrary = lazy(() => import("@/pages/ResourceLibrary"));
const SavedWork = lazy(() => import("@/pages/SavedWork"));
const StudyGuides = lazy(() => import("@/pages/StudyGuides"));
const WaitlistAdmin = lazy(() => import("@/pages/admin/WaitlistAdmin"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const ExamPrep = lazy(() => import("@/pages/ExamPrep"));
const APLibrary = lazy(() => import("@/pages/APLibrary"));
const APCourse = lazy(() => import("@/pages/APCourse"));
const MYPHub = lazy(() => import("@/pages/MYPHub"));
const MYPMentorship = lazy(() => import("@/pages/MYPMentorship"));
const MYPSubject = lazy(() => import("@/pages/MYPSubject"));
const MYPEAssessment = lazy(() => import("@/pages/MYPEAssessment"));
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppPreferencesProvider } from "@/contexts/AppPreferencesContext";
import AdminRoute from "@/components/AdminRoute";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route } from "react-router";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import { Navigate } from "react-router";


function App() {


return (
<HelmetProvider>
<AuthProvider>
<AppPreferencesProvider>
<BrowserRouter>
<Routes>
<Route path="/" element={<SiteLayout />}>
<Route index element={<AuthLandingRedirect />} />
<Route path="home" element={<AuthLandingRedirect />} />
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
						<Route path="resources/ib-myp-humanities-guide" element={<IBMYPHumanitiesGuide />} />
						<Route path="resources/best-ai-prompts-for-students" element={<BestAIPromptsForStudents />} />
						<Route path="resources/academic-burnout-guide" element={<AcademicBurnoutGuide />} />
						<Route path="resources/how-to-memorize-anything-fast" element={<MemorizationTechniques />} />
						<Route path="resources/college-essays-with-ai" element={<CollegeEssaysWithAI />} />
						<Route path="curricula" element={<CurriculumToolsIndex />} />
						<Route path="curricula/:curriculum/:feature" element={<CurriculumFeature />} />
						<Route path="ap" element={<APLibrary />} />
<Route path="ap/:courseSlug" element={<APCourse />} />
<Route path="ap/:courseSlug/:moduleSlug" element={<APCourse />} />
<Route path="myp" element={<MYPHub />} />
<Route path="myp/mentorship" element={<MYPMentorship />} />
						<Route path="myp/eassessment" element={<MYPEAssessment />} />
						<Route path="myp/subjects/:subjectSlug" element={<MYPSubject />} />
						<Route path="myp/subjects/:subjectSlug/:topicSlug" element={<MYPSubject />} />
<Route path="login" element={<Login />} />
<Route path="signup" element={<Signup />} />
<Route path="waitlist-pending" element={<WaitlistPending />} />
<Route path="connect-google" element={<ProtectedRoute><ConnectGoogle /></ProtectedRoute>} />
<Route path="auth/callback" element={<AuthCallback />} />
<Route path="onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
<Route path="today" element={<Navigate to="/main" replace />} />
<Route path="learn" element={<ProtectedRoute><LearningWorkspace /></ProtectedRoute>} />
<Route path="main" element={<ProtectedRoute><Main /></ProtectedRoute>} />
<Route path="exam-prep" element={<ProtectedRoute><ExamPrep /></ProtectedRoute>} />
<Route path="learning-hub" element={<Navigate to="/main" replace />} />
<Route path="notetaker" element={<ProtectedRoute><NotetakerQuiz /></ProtectedRoute>} />
<Route path="study-notebook" element={<ProtectedRoute><StudyNotebook /></ProtectedRoute>} />
<Route path="resource-library" element={<ProtectedRoute><ResourceLibrary /></ProtectedRoute>} />
<Route path="saved-work" element={<ProtectedRoute><SavedWork /></ProtectedRoute>} />
<Route path="study-guides/*" element={<StudyGuides />} />
<Route path="world-model" element={<Navigate to="/study-notebook" replace />} />
<Route path="study-zone" element={<ProtectedRoute><StudyZone /></ProtectedRoute>} />
<Route path="chatbot" element={<ProtectedRoute><AIChatbot /></ProtectedRoute>} />
<Route path="planner" element={<ProtectedRoute><StudyPlanner /></ProtectedRoute>} />
<Route path="answer-reviewer" element={<ProtectedRoute><AnswerReviewer /></ProtectedRoute>} />
<Route path="paper-maker" element={<ProtectedRoute><PaperMaker /></ProtectedRoute>} />

						{/* Archives routes */}
						<Route path="archives" element={<ArchivesHome />} />
						<Route path="archives-lnl" element={<ArchivesLnL />} />
						<Route path="archives-history" element={<ArchivesHistory />} />
						<Route path="archives-geography" element={<ArchivesGeography />} />
						{/* Legacy archive paths → current routes */}
						<Route path="archives/english" element={<Navigate to="/archives-lnl" replace />} />
						<Route path="archives/history" element={<Navigate to="/archives-history" replace />} />
						<Route path="archives/geography" element={<Navigate to="/archives-geography" replace />} />

<Route path="about" element={<About />} />
<Route path="projects" element={<Projects />} />
<Route path="privacy" element={<PrivacyPolicy />} />
<Route path="terms" element={<TermsOfService />} />
<Route path="features" element={<Features />} /> 
<Route path="study-tools" element={<StudyTools />} />
<Route path="vertex-ed" element={<Brand />} />
<Route path="user-settings" element={<ProtectedRoute accountControls><UserSettings /></ProtectedRoute>} />
<Route path="admin/waitlist" element={<AdminRoute><WaitlistAdmin /></AdminRoute>} />
<Route path="*" element={<NotFound />} />
  
</Route>
</Routes>
</BrowserRouter>
<SignedInFeedback />
<Toaster />
<Suspense fallback={null}><OptionalAppEnhancements /></Suspense>
</AppPreferencesProvider>
</AuthProvider>
</HelmetProvider>
);
}
export default App;

function SignedInFeedback() {
  const { user } = useAuth();
  return user ? <FeedbackLauncher /> : null;
}
