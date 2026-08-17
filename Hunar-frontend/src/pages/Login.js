import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = "https://localhost:7259/api";

export default function Login() {
  const [role, setRole] = useState("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password,
        role,
      });
      login(res.data.token, res.data.role);
      navigate("/jobs");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(121,101,245,0.14),transparent_28%),linear-gradient(135deg,_#F5F6F7_0%,_#ECE9FB_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="mx-auto flex w-full max-w-6xl overflow-hidden rounded-2xl border border-sand bg-white/90 shadow-[0_25px_80px_rgba(10,10,10,0.14)]"
      >
        <div className="hidden w-[45%] flex-col justify-between bg-ink p-10 text-cream lg:flex">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-mint">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-mint font-display font-bold text-ink">H</span>
              HunarAI
            </div>

            <h1 className="mt-8 font-display text-4xl font-semibold leading-tight text-white">
              Welcome back to your hiring workspace.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/60">
              Continue where you left off and manage applications, hiring goals, and skill-fit insights in one elegant experience.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
            <p className="text-sm font-semibold text-purple2">Why teams love HunarAI</p>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li>• Faster candidate screening with clear role-fit insights</li>
              <li>• Smooth onboarding for employers and job seekers alike</li>
              <li>• A calm, polished experience designed for focus</li>
            </ul>
          </div>
        </div>

        <div className="flex-1 bg-white p-8 sm:p-10 lg:p-12">
          <div className="mx-auto max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">Log in</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-ink">Access your account</h2>
            <p className="mt-3 text-sm leading-7 text-stone">
              Choose your role and sign in to explore jobs, applications, and recommendations.
            </p>

            <div className="mt-8 flex rounded-lg border border-sand bg-cream p-1">
              <button
                type="button"
                onClick={() => setRole("candidate")}
                className={`flex-1 rounded-md px-4 py-3 text-sm font-semibold transition ${
                  role === "candidate" ? "bg-white text-ink shadow-sm" : "text-stone"
                }`}
              >
                Candidate
              </button>
              <button
                type="button"
                onClick={() => setRole("recruiter")}
                className={`flex-1 rounded-md px-4 py-3 text-sm font-semibold transition ${
                  role === "recruiter" ? "bg-white text-ink shadow-sm" : "text-stone"
                }`}
              >
                Recruiter
              </button>
            </div>

            <form onSubmit={handleLogin} className="mt-8 space-y-4">
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </motion.p>
              )}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-stone">Email</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-sand bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-stone">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum six characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-sand bg-white px-4 py-3 pr-16 text-sm text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone hover:text-ink"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-purple2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Log in"}
              </motion.button>
            </form>

            <div className="mt-8 space-y-3 text-sm text-stone">
              <p>
                Don&apos;t have an account?{' '}
                <Link to="/register" className="font-semibold text-ink hover:text-gold">
                  Create a new account
                </Link>
              </p>
              <p>
                Or{' '}
                <button
                  type="button"
                  onClick={() => navigate("/jobs")}
                  className="font-semibold text-ink hover:text-gold"
                >
                  browse jobs without logging in
                </button>
                .
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
