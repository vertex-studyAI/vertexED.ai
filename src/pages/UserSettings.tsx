import { Helmet } from "react-helmet-async";
import NeumorphicCard from "@/components/NeumorphicCard";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Settings } from "lucide-react";
import PageSection from "@/components/PageSection";
import React from "react";

export default function UserSettings() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Logout error", e);
      navigate("/", { replace: true });
    }
  };

  const exportAccountData = () => {
    // Minimal client-side export of account info (safe demo)
    const data = {
      accountType: "Free Tier",
      memberSince: "Today",
      studySessions: 0,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vertex_account_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Helmet>
        <title>Vertex — Account Settings</title>
        <meta name="description" content="Manage your Vertex account settings and preferences." />
  <link rel="canonical" href="https://www.vertexed.app/user-settings" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <PageSection className="max-w-2xl">
        <h1 className="text-3xl font-semibold mb-6 flex items-center gap-3 brand-text-gradient">
          <Settings className="h-8 w-8" />
          Account Settings
        </h1>

        <div className="space-y-6">
          <NeumorphicCard className="p-8" title="Profile Information">
            <div className="flex items-center gap-4 mb-6">
              <div className="neu-surface p-4 rounded-full">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium">Guest User</h3>
                <p className="opacity-70">Vertex Student Account</p>
              </div>
            </div>
            
            <div className="space-y-4 text-sm opacity-80">
              <div className="flex justify-between">
                <span>Account Type:</span>
                <span>Free Tier</span>
              </div>
              <div className="flex justify-between">
                <span>Member Since:</span>
                <span>Today</span>
              </div>
              <div className="flex justify-between">
                <span>Study Sessions:</span>
                <span>0</span>
              </div>
            </div>
          </NeumorphicCard>

          <NeumorphicCard className="p-8" title="Quick Actions">
            <div className="space-y-4">
              <button 
                onClick={() => navigate("/main")}
                className="w-full neu-button text-left justify-start gap-3 py-4"
              >
                ← Back to Dashboard
              </button>
              
              <button 
                onClick={handleLogout}
                className="w-full neu-button text-left justify-start gap-3 py-4 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>

              {/* NEW BUTTON: Export account data */}
              <button
                onClick={exportAccountData}
                className="w-full neu-button text-left justify-start gap-3 py-4 bg-white/5 hover:bg-white/10"
                title="Download a copy of your account data"
              >
                Export Account Data
              </button>
            </div>
          </NeumorphicCard>
        </div>
      </PageSection>
    </>
  );
}
