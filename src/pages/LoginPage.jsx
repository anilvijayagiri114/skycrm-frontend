import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { setToken } from "../utils/auth";
import { Navigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  UserCog,
  TrendingUp,
  BarChart3,
  ArrowLeft,
  Lock,
  Mail,
  CheckCircle2,
} from "lucide-react";

const roleThemes = {
  Admin: {
    gradient: "from-blue-900 via-blue-700 to-blue-600",
    icon: <ShieldCheck className="w-14 h-14 text-white" />,
    title: "Admin Login",
    subtitle: "Access all administrative functions",
    features: [
      "User Management",
      "System Config",
      "Security & Compliance",
      "Analytics",
    ],
    img: "/admin-dashboard-with-security-controls-and-user-ma.jpg",
  },
  "Sales Manager": {
    gradient: "from-purple-900 via-purple-700 to-purple-600",
    icon: <Users className="w-14 h-14 text-white" />,
    title: "Sales Manager Login",
    subtitle: "Lead your team and track performance",
    features: [
      "Team Analytics",
      "Goal Tracking",
      "Forecasting",
      "Coaching Tools",
    ],
    img: "/sales-team-management-dashboard-with-performance-m.jpg",
  },
  "Sales Team Lead": {
    gradient: "from-indigo-900 via-indigo-700 to-indigo-600",
    icon: <BarChart3 className="w-14 h-14 text-white" />,
    title: "Team Lead Login",
    subtitle: "Monitor your team and drive success",
    features: [
      "Coordination Tools",
      "Performance Tracking",
      "Goal Management",
      "Mentorship",
    ],
    img: "/team-performance-dashboard-with-analytics-and-goal.jpg",
  },
  "Sales Representatives": {
    gradient: "from-teal-900 via-teal-700 to-teal-600",
    icon: <TrendingUp className="w-14 h-14 text-white" />,
    title: "Sales Representative Login",
    subtitle: "Access your sales dashboard",
    features: [
      "Lead Management",
      "Pipeline Tracking",
      "Client Hub",
      "Sales Insights",
    ],
    img: "/sales-pipeline-dashboard-with-leads-and-deals.jpg",
  },
};

export default function LoginPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const selectedRole = loc.state?.role || "Admin";
  const navigate = useNavigate();
  const theme = roleThemes[selectedRole];
  const [waiting, SetWaiting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const onSubmit = async (e) => {
    e.preventDefault();
    SetWaiting(true);
    try {
      console.log("Attempting login...");
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });
      console.log("Login successful:", data);
      setToken(data.token);
      if (data) {
        setEmail("");
        setPassword("");
      }

      if (!data.user?.defaultPasswordChanged) {
        nav("/change-password");
      } else {
        nav("/");
      }
    } catch (e) {
      console.error("Login error:", e);
      setErr(
        e.response?.data?.error ||
          "Login failed. Please check your credentials."
      );
    } finally {
      SetWaiting(false);
    }
  };

  const HandleBack = () => {
    navigate("/login/select");
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${theme.gradient} flex items-center justify-center p-4 relative overflow-hidden`}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Info panel */}
        <div className="hidden lg:block space-y-8 animate-fade-in">
          <button
            onClick={HandleBack}
            className="inline-flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Home
          </button>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl border border-white/30">
                {theme.icon}
              </div>
              <div>
                <h1 className="text-5xl font-bold text-white">Sky CRM</h1>
                <p className="text-white/80 text-lg">{selectedRole} Portal</p>
              </div>
            </div>
            <div className="space-y-4 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <h2 className="text-4xl font-bold text-white">
                {theme.subtitle}
              </h2>
              <div className="space-y-3 pt-4">
                {theme.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5 text-white/70" />
                    <span className="text-base">{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <img
              src={theme.img}
              alt={`${selectedRole} Dashboard`}
              className="rounded-3xl shadow-2xl border-4 border-white/20"
            />
          </div>
        </div>

        {/* Login panel */}
        <div className="w-full max-w-md mx-auto shadow-2xl rounded-xl animate-slide-in-right bg-white/95 backdrop-blur-md p-10">
          <div className="space-y-6 text-center pb-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue/30 to-blue/50 rounded-3xl flex items-center justify-center animate-bounce-in shadow-xl">
              {theme.icon}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {theme.title}
              </h2>
              <p className="text-base mt-3 text-gray-600">
                Enter your credentials to continue
              </p>
            </div>
          </div>

          {err && <div className="text-sm text-red-600 text-center">{err}</div>}

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-base font-medium block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-gray-900 transition-colors"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-base font-medium block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-gray-900 transition-colors"
                  required
                />
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded w-4 h-4" /> Remember
                me
              </label>
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() =>
                  nav("/forgot-password", {
                    state: { role: selectedRole, email },
                  })
                }
              >
                Forgot password?
              </button>
            </div>
            <button
              type="submit"
              disabled={waiting}
              className={`w-full py-3 rounded-lg transition-all ${
                waiting
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gray-900 hover:bg-gray-800 text-white"
              }`}
            >
              {waiting ? (
                <div className="flex justify-center items-center gap-2">
                 
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={HandleBack}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to role selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
