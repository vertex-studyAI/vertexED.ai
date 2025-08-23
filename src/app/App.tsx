import SiteLayout from "@/components/layout/SiteLayout";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Main from "@/pages/Main";
import NotetakerQuiz from "@/pages/NotetakerQuiz";
import StudyZone from "@/pages/StudyZone";
import AIChatbot from "@/pages/AIChatbot";
import StudyPlanner from "@/pages/StudyPlanner";
import ImageAnswer from "@/pages/ImageAnswer";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";
import PaperMaker from "@/pages/PaperMaker";
import UserSettings from "@/pages/UserSettings";
import { AuthProvider } from "@/contexts/AuthContext";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/next"

const App = () => (
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
            <Route path="image-answer" element={<ImageAnswer />} />
            <Route path="paper-maker" element={<PaperMaker />} />
            <Route path="about" element={<About />} />
            <Route path="settings" element={<UserSettings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
  <SpeedInsights />
  <Analytics />
    </AuthProvider>
  </HelmetProvider>
);

export default App;
