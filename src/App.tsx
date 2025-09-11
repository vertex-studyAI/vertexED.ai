import { BrowserRouter, Routes, Route } from "react-router-dom";
import SiteLayout from "@/components/layout/SiteLayout";
import Home from "@/pages/Home";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AuthProvider } from "@/contexts/AuthContext";
import { lazy, Suspense } from "react";
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const Main = lazy(() => import("@/pages/Main"));
const NotetakerQuiz = lazy(() => import("@/pages/NotetakerQuiz"));
const StudyZone = lazy(() => import("@/pages/StudyZone"));
const AIChatbot = lazy(() => import("@/pages/AIChatbot"));
const StudyPlanner = lazy(() => import("@/pages/StudyPlanner"));
const ImageAnswer = lazy(() => import("@/pages/ImageAnswer"));
const About = lazy(() => import("@/pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PaperMaker = lazy(() => import("@/pages/PaperMaker"));
const UserSettings = lazy(() => import("@/pages/UserSettings"));

const App = () => (
  <HelmetProvider>
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={null}>
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
              <Route path="settings" element={<UserSettings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <SpeedInsights />
        <Analytics />
      </BrowserRouter>
    </AuthProvider>
  </HelmetProvider>
);

export default App;
