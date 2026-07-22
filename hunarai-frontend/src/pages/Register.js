import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API_BASE = "https://localhost:7259/api";

export default function Register() {
  const [role, setRole] = useState("Candidate");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/auth/register`, {
        fullName,
        email,
        password,
        role,
      });
      navigate("/");
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const messages = Object.values(errors).flat().join(" ");
        setError(messages);
      } else {
        setError("Registration failed. Please try again.");
      }
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
        {/* Left panel */}
        <div className="hidden md:flex flex-col justify-between w-1/2 bg-ink p-10">
          <div>
            <div className="flex items-center gap-2 mb-10">
              <div className="w-7 h-7 rounded-md bg-gold flex items-center justify-center">
                <span className="text-ink font-semibold text-sm">H</span>
              </div>
              <span className="text-cream font-medium">HunarAI</span>
            </div>
            <p className="text-2xl font-medium text-cream leading-snug mb-3">
              Start your journey
              <br />
              to the right role.
            </p>
            <p className="text-sm text-stone leading-relaxed">
              Upload your CV, get matched semantically, and see exactly what skills
              you need to close the gap.
            </p>
          </div>
          <div className="flex gap-8">
            <div>
              <p className="text-xl font-medium text-gold">AI</p>
              <p className="text-xs text-stone/80">powered matching</p>
            </div>
            <div>
              <p className="text-xl font-medium text-gold">100%</p>
              <p className="text-xs text-stone/80">semantic search</p>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-full md:w-1/2 bg-white p-10 flex flex-col justify-center">
          <h1 className="text-lg font-medium text-ink mb-1">Create account</h1>
          <p className="text-sm text-stone mb-6">Join HunarAI today</p>

          <div className="flex bg-sand/40 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setRole("Candidate")}
              className={`flex-1 text-sm py-1.5 rounded-md transition-all duration-200 ${
                role === "Candidate"
                  ? "bg-white shadow-sm text-ink font-medium"
                  : "text-stone"
              }`}
            >
              Candidate
            </button>
            <button
              type="button"
              onClick={() => setRole("Recruiter")}
              className={`flex-1 text-sm py-1.5 rounded-md transition-all duration-200 ${
                role === "Recruiter"
                  ? "bg-white shadow-sm text-ink font-medium"
                  : "text-stone"
              }`}
            >
              Recruiter
            </button>
          </div>

          <form onSubmit={handleRegister}>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4"
              >
                {error}
              </motion.p>
            )}

            <label className="block text-xs text-stone mb-1">Full name</label>
            <input
              type="text"
              placeholder="Muhammad Uzair"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full border border-sand rounded-lg px-3 py-2.5 text-sm mb-4 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            />

            <label className="block text-xs text-stone mb-1">Email</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-sand rounded-lg px-3 py-2.5 text-sm mb-4 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
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
              {loading ? "Creating account..." : "Create account"}
              {!loading && <span>→</span>}
            </motion.button>
          </form>

          <p className="text-sm text-stone text-center mt-6">
            Already have an account?{" "}
            <Link to="/" className="text-gold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}