import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Vertex — Sign up</title>
        <meta name="description" content="Create your Vertex account to unlock the AI-powered study toolkit." />
        <link rel="canonical" href={typeof window!== 'undefined' ? window.location.href : '/signup'} />
      </Helmet>
      <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <motion.form
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative neu-card w-full max-w-md p-8"
          onSubmit={(e) => {
            e.preventDefault();
            login();
            navigate("/main");
          }}
        >
          <h1 className="text-3xl font-semibold mb-6 text-center">Sign up</h1>
          <div className="space-y-4">
            <div className="neu-input">
              <input aria-label="Username" placeholder="Username" className="neu-input-el" />
            </div>
            <div className="neu-input">
              <input aria-label="Email" placeholder="Email" className="neu-input-el" />
            </div>
            <div className="neu-input">
              <input aria-label="Password" placeholder="Password" type="password" className="neu-input-el" />
            </div>
            <button className="w-full neu-button py-3 mt-2">Create account</button>
          </div>
          <p className="text-center mt-4 text-sm opacity-80">
            Already have an account? <a href="/login" className="sketch-underline">Log in</a>
          </p>
        </motion.form>
      </div>
    </>
  );
}
