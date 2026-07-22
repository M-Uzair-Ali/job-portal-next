import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

const API_BASE = "https://localhost:7259/api";

const MOCK_JOBS = [
  { id: "6f6e486b-a58e-41ce-94de-e9558f0da678", title: "Python AI Engineer @ TechCorp" },
  { id: "job-2", title: "ML Backend Developer @ Careem" },
  { id: "job-3", title: "Data Scientist @ Systems Ltd" },
];

function CircularGauge({ percent }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#2A2622" strokeWidth="8" />
        <motion.circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="#C9973A"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          transform="rotate(-90 48 48)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl font-semibold text-cream"
        >
          {Math.round(percent)}%
        </motion.span>
      </div>
    </div>
  );
}

function matchLabel(percent) {
  if (percent >= 85) return "Strong match";
  if (percent >= 60) return "Moderate match";
  return "Needs development";
}

function learnLink(skill) {
  return `https://www.youtube.com/results?search_query=learn+${encodeURIComponent(skill)}`;
}

export default function SkillGap() {
  const location = useLocation();
  const passedJob = location.state;

  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(passedJob?.jobId || MOCK_JOBS[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a resume PDF first.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    const token = localStorage.getItem("token");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await axios.post(`${API_BASE}/files/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      const cvFilePath = uploadRes.data.filePath;

      const skillGapRes = await axios.post(
        `${API_BASE}/skillgap`,
        {
          jobId,
          cVFilePath: cvFilePath,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult(skillGapRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Please log in as a Candidate first.");
      } else {
        setError("Something went wrong analyzing your resume. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream px-6 py-8 md:px-12">
      <Navbar />

      <div className="flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <label className="block text-xs font-medium text-ink mb-2">
              Compare against
            </label>

            {passedJob && (
              <p className="text-xs text-stone mb-2">
                Pre-selected from Jobs page:{" "}
                <span className="text-ink">{passedJob.jobTitle}</span>
              </p>
            )}

            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full border border-sand rounded-lg px-3 py-2.5 text-sm mb-4 bg-white outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            >
              {MOCK_JOBS.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-sand rounded-2xl p-8 text-center bg-white transition-colors duration-200 hover:border-gold/60 mb-4"
            >
              <input
                type="file"
                accept="application/pdf"
                id="resume-upload"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="resume-upload" className="cursor-pointer">
                {file ? (
                  <>
                    <p className="text-sm font-medium text-ink mb-1">{file.name}</p>
                    <p className="text-xs text-stone">Click to choose a different file</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-ink mb-1">
                      Drop your resume here
                    </p>
                    <p className="text-xs text-stone">or click to browse (PDF only)</p>
                  </>
                )}
              </label>
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
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gold hover:bg-gold/90 disabled:opacity-60 text-ink text-sm font-medium py-3 rounded-lg transition-colors duration-200 mb-10"
            >
              {loading ? "Analyzing..." : "Analyze skill gap"}
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-6 bg-ink rounded-2xl p-6 mb-6">
                  <CircularGauge percent={result.match_percentage} />
                  <div>
                    <p className="text-sm font-medium text-cream mb-1">
                      {matchLabel(result.match_percentage)}
                    </p>
                    <p className="text-xs text-stone leading-relaxed">
                      {result.feedback}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-medium text-ink mb-3">
                      Matched skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.matched_skills.map((skill) => (
                        <span
                          key={skill}
                          className="bg-sand/50 text-gold text-xs font-medium px-3 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-ink mb-3">
                      Missing skills
                    </p>
                    <div className="flex flex-col gap-2">
                      {result.missing_skills.map((skill) => (
                        <a
                          key={skill}
                          href={learnLink(skill)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between border border-sand rounded-lg px-3 py-2 text-sm text-ink hover:border-gold transition-colors duration-150"
                        >
                          <span>{skill}</span>
                          <span className="text-gold text-xs">Learn →</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}