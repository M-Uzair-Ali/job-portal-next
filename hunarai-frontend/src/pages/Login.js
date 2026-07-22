import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";   // add this

const API_BASE = "https://localhost:7259/api";

export default function Login() {
  const [role, setRole] = useState("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();   // add this

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
      login(res.data.token, res.data.role);   // replaces the two localStorage lines
      navigate("/jobs");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-xl"
      >
        {/* Left panel - brand storytelling */}
        <div className="hidden md:flex flex-col justify-between w-1/2 bg-ink p-10">
          <div>
            <div className="flex items-center gap-2 mb-10">
              <div className="w-7 h-7 rounded-md bg-gold flex items-center justify-center">
                <span className="text-ink font-semibold text-sm">H</span>
              </div>
              <span className="text-cream font-medium">HunarAI</span>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-2xl font-medium text-cream leading-snug mb-3"
            >
              Know exactly what's
              <br />
              standing between you
              <br />
              and the job.
            </motion.p>
            <p className="text-sm text-stone leading-relaxed">
              Semantic matching, explainable scores, and a learning path
              built from the gap.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex gap-8"
          >
            <div>
              <p className="text-xl font-medium text-gold">70%</p>
              <p className="text-xs text-stone/80">avg match clarity</p>
            </div>
            <div>
              <p className="text-xl font-medium text-gold">3</p>
              <p className="text-xs text-stone/80">skill gaps found</p>
            </div>
          </motion.div>
        </div>

        {/* Right panel - form */}
        <div className="w-full md:w-1/2 bg-white p-10 flex flex-col justify-center">
          <h1 className="text-lg font-medium text-ink mb-1">Welcome back</h1>
          <p className="text-sm text-stone mb-6">Sign in to continue</p>

          <div className="flex bg-sand/40 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setRole("candidate")}
              className={`flex-1 text-sm py-1.5 rounded-md transition-all duration-200 ${
                role === "candidate"
                  ? "bg-white shadow-sm text-ink font-medium"
                  : "text-stone"
              }`}
            >
              Candidate
            </button>
            <button
              type="button"
              onClick={() => setRole("recruiter")}
              className={`flex-1 text-sm py-1.5 rounded-md transition-all duration-200 ${
                role === "recruiter"
                  ? "bg-white shadow-sm text-ink font-medium"
                  : "text-stone"
              }`}
            >
              Recruiter
            </button>
          </div>

          <form onSubmit={handleLogin}>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4"
              >
                {error}
              </motion.p>
            )}

            <label className="block text-xs text-stone mb-1">Email</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-sand rounded-lg px-3 py-2.5 text-sm mb-4 outline-none transition-all duration-200 focus:border-gold focus:ring-2 focus:ring-gold/20"
            />

            <label className="block text-xs text-stone mb-1">Password</label>
<div className="relative mb-6">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Min 6 characters"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    className="w-full border border-sand rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 pr-10"
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-ink text-xs"
  >
    {showPassword ? "Hide" : "Show"}
  </button>
</div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold/90 disabled:opacity-60 text-ink text-sm font-medium py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <span>→</span>}
            </motion.button>
          </form>

          <p className="text-sm text-stone text-center mt-6">
            No account?{" "}
            <Link to="/register" className="text-gold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}