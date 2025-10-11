// File: /src/App.tsx
import SiteLayout from "@/components/layout/SiteLayout";
import Home from "@/pages/Home"; 
import Features from "@/pages/Features";
import { lazy } from "react";
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const Main = lazy(() => import("@/pages/Main"));
const NotetakerQuiz = lazy(() => import("@/pages/NotetakerQuiz"));
const StudyZone = lazy(() => import("@/pages/StudyZone"));
const AIChatbot = lazy(() => import("@/pages/AIChatbot"));
const StudyPlanner = lazy(() => import("@/pages/StudyPlanner"));
const AnswerReviewer = lazy(() => import("@/pages/AnswerReviewer"));
const About = lazy(() => import("@/pages/About"));
const NotFound = lazy(() => import("@/pages/NotFound"));
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
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";


function App() {
useEffect(() => {
const idle = (cb: () => void) => {
// @ts-ignore
return typeof requestIdleCallback !== 'undefined' ? requestIdleCallback(cb, { timeout: 1500 }) : setTimeout(cb, 500);
};
const cancel = (id: any) => {
// @ts-ignore
return typeof cancelIdleCallback !== 'undefined' ? cancelIdleCallback(id) : clearTimeout(id);
};
const warm = () => {
import("@/pages/Login");
import("@/pages/Signup");
import("@/pages/About");
import("@/pages/Main");
import("@/pages/StudyPlanner");
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
<Route path="main" element={<Main />} />
<Route path="notetaker" element={<NotetakerQuiz />} />
<Route path="study-zone" element={<StudyZone />} />
<Route path="chatbot" element={<AIChatbot />} />
<Route path="planner" element={<StudyPlanner />} />
<Route path="answer-reviewer" element={<AnswerReviewer />} />
<Route path="paper-maker" element={<PaperMaker />} />
<Route path="about" element={<About />} />
<Route path="features" element={<Features />} /> 
<Route path="vertex-ed" element={<Brand />} />
<Route path="settings" element={<UserSettings />} />
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
