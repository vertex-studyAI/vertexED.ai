// File: /src/App.tsx
import SiteLayout from "@/components/layout/SiteLayout";
import Home from "@/pages/Home"; 
import Features from "@/pages/Features";
import { lazy } from "react";
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const Main = lazy(() => import("@/pages/Main"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const NotetakerQuiz = lazy(() => import("@/pages/NotetakerQuiz"));
const StudyZone = lazy(() => import("@/pages/StudyZone"));
const AIChatbot = lazy(() => import("@/pages/AIChatbot"));
const StudyPlanner = lazy(() => import("@/pages/StudyPlanner"));
const AnswerReviewer = lazy(() => import("@/pages/AnswerReviewer"));
const About = lazy(() => import("@/pages/About"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const ArchivesHome = lazy(() => import("@/pages/ArchivesHome"));
const ArchivesNotes = lazy(() => import("@/pages/ArchivesNotes"));
const ArchivesSubjects = lazy(() => import("@/pages/ArchivesSubjects"));
const PaperMaker = lazy(() => import("@/pages/PaperMaker"));
const UserSettings = lazy(() => import("@/pages/UserSettings"));
const Brand = lazy(() => import("@/pages/Brand"));
const ResourcesIndex = lazy(() => import("@/pages/resources/Index"));
const AIStudyPlannerArticle = lazy(() => import("@/pages/resources/AIStudyPlanner"));
const PaperMakerGuide = lazy(() => import("@/pages/resources/PaperMakerGuide"));
const NotesToFlashcardsArticle = lazy(() => import("@/pages/resources/NotesToFlashcards"));
const AIAnswerReviewerArticle = lazy(() => import("@/pages/resources/AIAnswerReviewer"));
const StudyTechniquesActiveRecall = lazy(() => import("@/pages/resources/StudyTechniquesActiveRecall"));
const ExamStrategyTimeManagement = lazy(() => import("@/pages/resources/ExamStrategyTimeManagement"));
const SubjectGuidesCommonMistakes = lazy(() => import("@/pages/resources/SubjectGuidesCommonMistakes"));
import { AuthProvider } from "@/contexts/AuthContext";
import { HelmetProvider } from "react-helmet-async";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";


function App() {
useEffect(() => {
	// Avoid prefetching on constrained networks or touch-only devices to improve mobile TTI
	const isFinePointer = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(hover:hover) and (pointer:fine)').matches : true;
	// @ts-ignore
	const connection = (navigator as any).connection;
	const saveData = !!connection?.saveData;
	const slow = ['slow-2g','2g','3g'].includes(connection?.effectiveType || '');
	if (!isFinePointer || saveData || slow) return;

	const idle = (cb: () => void) => {
		// @ts-ignore
		return typeof requestIdleCallback !== 'undefined' ? requestIdleCallback(cb, { timeout: 3000 }) : setTimeout(cb, 1200);
	};
	const cancel = (id: any) => {
		// @ts-ignore
		return typeof cancelIdleCallback !== 'undefined' ? cancelIdleCallback(id) : clearTimeout(id);
	};

	const warm = () => {
		// Wait until after the main load event to avoid competing with critical path
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
<AuthProvider>
<BrowserRouter>
<Routes>
<Route path="/" element={<SiteLayout />}>
<Route index element={<Home />} />
<Route path="home" element={<Home />} />
						<Route path="resources" element={<ResourcesIndex />} />
						<Route path="resources/ai-study-planner" element={<AIStudyPlannerArticle />} />
						<Route path="resources/ib-igcse-paper-maker" element={<PaperMakerGuide />} />
						<Route path="resources/notes-to-flashcards" element={<NotesToFlashcardsArticle />} />
						<Route path="resources/ai-answer-reviewer" element={<AIAnswerReviewerArticle />} />
						<Route path="resources/active-recall-spaced-repetition" element={<StudyTechniquesActiveRecall />} />
						<Route path="resources/exam-strategy-time-management" element={<ExamStrategyTimeManagement />} />
						<Route path="resources/subject-guides-common-mistakes" element={<SubjectGuidesCommonMistakes />} />
<Route path="login" element={<Login />} />
<Route path="signup" element={<Signup />} />
<Route path="auth/callback" element={<AuthCallback />} />
<Route path="main" element={<ProtectedRoute><Main /></ProtectedRoute>} />
<Route path="notetaker" element={<ProtectedRoute><NotetakerQuiz /></ProtectedRoute>} />
<Route path="study-zone" element={<ProtectedRoute><StudyZone /></ProtectedRoute>} />
<Route path="chatbot" element={<ProtectedRoute><AIChatbot /></ProtectedRoute>} />
<Route path="planner" element={<ProtectedRoute><StudyPlanner /></ProtectedRoute>} />
<Route path="answer-reviewer" element={<ProtectedRoute><AnswerReviewer /></ProtectedRoute>} />
<Route path="paper-maker" element={<ProtectedRoute><PaperMaker /></ProtectedRoute>} />

						{/* Archives routes */}
						<Route path="archives" element={<ArchivesHome />} />
						<Route path="archives/notes" element={<ArchivesNotes />} />
						<Route path="archives-subjects" element={<ArchivesSubjects />} />

<Route path="about" element={<About />} />
<Route path="features" element={<Features />} /> 
<Route path="vertex-ed" element={<Brand />} />
<Route path="user-settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
<Route path="*" element={<NotFound />} />
  
</Route>
</Routes>
</BrowserRouter>
<SpeedInsights />
<Analytics />
</AuthProvider>
</HelmetProvider>
);
}
export default App;
