import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const API_BASE = "https://localhost:7259/api";

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    jobType: "Full-time",
    minSalary: "",
    maxSalary: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      await axios.post(
  `${API_BASE}/jobs`,
  {
    title: form.title,
    description: form.description,
    location: form.location,
    jobType: form.jobType,
    salary: form.minSalary ? Number(form.minSalary) : 0,
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);
navigate("/jobs");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Please log in as a Recruiter first.");
      } else {
        setError("Something went wrong posting this job. Please check your inputs.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream px-6 py-8 md:px-12">
      <Navbar />

      <div className="flex flex-col items-center">
        <div className="w-full max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-lg font-medium text-ink mb-1">Post a job</h1>
            <p className="text-sm text-stone mb-6">
              This job will be matched against candidate resumes automatically.
            </p>

            <form onSubmit={handleSubmit}>
              <label className="block text-xs font-medium text-ink mb-1">
                Job title
              </label>
              <input
                type="text"
                placeholder="e.g. Python AI Engineer"
                value={form.title}
                onChange={update("title")}
                required
                className="w-full border border-sand rounded-lg px-3 py-2.5 text-sm mb-4 bg-white outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              />

              <label className="block text-xs font-medium text-ink mb-1">
                Description
              </label>
              <textarea
                placeholder="Role responsibilities, expectations..."
                value={form.description}
                onChange={update("description")}
                required
                rows={4}
                className="w-full border border-sand rounded-lg px-3 py-2.5 text-sm mb-4 bg-white outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 resize-none"
              />

              <label className="block text-xs font-medium text-ink mb-1">
                Required skills
              </label>
              <input
                type="text"
                placeholder="python, fastapi, rag, sbert (comma-separated)"
                value={form.requiredSkills}
                onChange={update("requiredSkills")}
                required
                className="w-full border border-sand rounded-lg px-3 py-2.5 text-sm mb-4 bg-white outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              />

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Lahore / Remote"
                    value={form.location}
                    onChange={update("location")}
                    required
                    className="w-full border border-sand rounded-lg px-3 py-2.5 text-sm bg-white outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">
                    Job type
                  </label>
                  <select
                    value={form.jobType}
                    onChange={update("jobType")}
                    className="w-full border border-sand rounded-lg px-3 py-2.5 text-sm bg-white outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">
                    Min salary
                  </label>
                  <input
                    type="number"
                    placeholder="80000"
                    value={form.minSalary}
                    onChange={update("minSalary")}
                    className="w-full border border-sand rounded-lg px-3 py-2.5 text-sm bg-white outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">
                    Max salary
                  </label>
                  <input
                    type="number"
                    placeholder="150000"
                    value={form.maxSalary}
                    onChange={update("maxSalary")}
                    className="w-full border border-sand rounded-lg px-3 py-2.5 text-sm bg-white outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gold hover:bg-gold/90 disabled:opacity-60 text-ink text-sm font-medium py-3 rounded-lg transition-colors duration-200"
              >
                {loading ? "Posting..." : "Post job"}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}