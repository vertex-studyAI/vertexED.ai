// File: /src/App.tsx
import SiteLayout from "@/components/layout/SiteLayout";
import Home from "@/pages/home"; // <-- changed to lowercase path to match filesystems that care about case
import Features from "@/pages/features"; // <-- added Features import
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
<Route path="login" element={<Login />} />
<Route path="signup" element={<Signup />} />
<Route path="main" element={<Main />} />
<Route path="notetaker" element={<NotetakerQuiz />} />
<Route path="study-zone" element={<StudyZone />} />
<Route path="chatbot" element={<AIChatbot />} />
<Route path="planner" element={<StudyPlanner />} />
<Route path="Answer-Reviewer" element={<AnswerReviewer />} />
<Route path="paper-maker" element={<PaperMaker />} />
<Route path="about" element={<About />} />
<Route path="features" element={<Features />} /> {/* <-- ADDED route for /features */}
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
