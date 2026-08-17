import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useToast } from "../hooks/useToast";

const API_BASE = "https://localhost:7259/api";

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyStatus, setApplyStatus] = useState("idle");
  const [descExpanded, setDescExpanded] = useState(false);
  const fileInputRef = useRef(null);

  const DESC_PREVIEW_LENGTH = 600;

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`${API_BASE}/jobs/${jobId}`);
        setJob(res.data);
      } catch (err) {
        toast.error("Failed to load job details");
        navigate("/jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId, navigate, toast]);

  const handleApply = async (file) => {
    if (!file) {
      toast.error("Please select a resume (PDF)");
      return;
    }

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "Candidate") {
      toast.error("Please log in as a Candidate to apply.");
      navigate("/login");
      return;
    }

    setApplyStatus("uploading");

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
      setApplyStatus("applying");

      await axios.post(
        `${API_BASE}/applications`,
        { jobId, cvFilePath },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setApplyStatus("applied");
      toast.success("Application submitted successfully!");
    } catch (err) {
      if (err.response?.status === 409) {
        setApplyStatus("already-applied");
        toast.info("You've already applied to this job");
      } else {
        setApplyStatus("error");
        toast.error("Failed to apply: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleAnalyzeClick = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "Candidate") {
      toast.error("Please log in as a Candidate to analyze skills.");
      navigate("/login");
      return;
    }

    navigate("/skill-gap", { state: { jobId: job.id, jobTitle: `${job.title} @ ${job.recruiterName}` } });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleApply(file);
    }
  };

  const handleApplyClick = () => {
    if (!token || role !== "Candidate") {
      toast.error("Please log in as a Candidate to apply.");
      navigate("/login");
      return;
    }
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-stone">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const requiredSkills = job.requiredSkills ? job.requiredSkills.split(";").filter(s => s.trim()) : [];

  return (
    <div className="min-h-screen bg-cream px-6 py-8 md:px-12">

      <div className="max-w-4xl mx-auto">
        {!token && (
          <div className="bg-white border border-gold/30 rounded-md p-4 mb-6 text-sm text-ink">
            This job is visible publicly. Login as a Candidate to apply or analyze skill fit.
          </div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/jobs")}
            className="text-sm text-stone hover:text-ink mb-4 flex items-center gap-1"
          >
            ← Back to Jobs
          </button>
          
          <h1 className="text-4xl font-bold text-ink mb-2">{job.title}</h1>
          <p className="text-lg text-stone mb-4">{job.recruiterName}</p>
          
          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="bg-white border border-sand rounded-lg p-4">
              <p className="text-xs text-stone mb-1">Salary</p>
              <p className="text-lg font-bold text-gold">PKR {job.salary?.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-sand rounded-lg p-4">
              <p className="text-xs text-stone mb-1">Location</p>
              <p className="text-lg font-bold text-ink">{job.location}</p>
            </div>
            <div className="bg-white border border-sand rounded-lg p-4">
              <p className="text-xs text-stone mb-1">Job Type</p>
              <p className="text-lg font-bold text-ink">{job.jobType}</p>
            </div>
            <div className="bg-white border border-sand rounded-lg p-4">
              <p className="text-xs text-stone mb-1">Deadline</p>
              <p className="text-lg font-bold text-ink">
                {new Date(job.expiryDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-sand rounded-md p-8 mb-8"
        >
          {job.keyPoints?.length > 0 && (
            <div className="mb-8 bg-gold/5 border border-gold/20 rounded-lg p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold mb-3">
                Key Highlights
              </p>
              <ul className="space-y-2">
                {job.keyPoints.map((point, i) => (
                  <li key={i} className="flex gap-2 text-sm text-ink">
                    <span className="text-gold shrink-0">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h2 className="text-2xl font-bold text-ink mb-4">Job Description</h2>
          <div className="prose prose-sm max-w-none text-stone whitespace-pre-wrap mb-2">
            {descExpanded || job.description.length <= DESC_PREVIEW_LENGTH
              ? job.description
              : `${job.description.slice(0, DESC_PREVIEW_LENGTH)}...`}
          </div>
          {job.description.length > DESC_PREVIEW_LENGTH && (
            <button
              onClick={() => setDescExpanded((v) => !v)}
              className="text-sm font-medium text-gold hover:text-purple2 mb-8"
            >
              {descExpanded ? "Read less" : "Read more"}
            </button>
          )}
          {job.description.length <= DESC_PREVIEW_LENGTH && <div className="mb-8" />}

          {/* Required Skills */}
          {requiredSkills.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-ink mb-4">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {requiredSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-sand/30 text-ink text-sm px-4 py-2 rounded-full border border-sand"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3 flex-col md:flex-row"
        >
          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <button
            onClick={handleApplyClick}
            disabled={applyStatus === "uploading" || applyStatus === "applying" || applyStatus === "applied"}
            className={`flex-1 font-medium py-3 rounded-lg transition-colors ${
              applyStatus === "applied" || applyStatus === "already-applied"
                ? "bg-sand/50 text-stone cursor-default"
                : applyStatus === "error"
                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                : "bg-gold hover:bg-purple2 text-white disabled:opacity-60"
            }`}
          >
            {applyStatus === "uploading" ? "Uploading..." : 
             applyStatus === "applying" ? "Applying..." :
             applyStatus === "applied" ? "Applied ✓" :
             applyStatus === "already-applied" ? "Already Applied" :
             applyStatus === "error" ? "Apply Failed" :
             "Apply to Job"}
          </button>

          <button
            onClick={handleAnalyzeClick}
            className="flex-1 bg-white border border-sand text-ink font-medium py-3 rounded-lg hover:bg-sand/20 transition-colors"
          >
            Analyze Skill Gap
          </button>

          <button
            onClick={() => navigate("/jobs")}
            className="flex-1 bg-white border border-stone text-ink font-medium py-3 rounded-lg hover:bg-stone/5 transition-colors"
          >
            Back to Jobs
          </button>
        </motion.div>
      </div>
    </div>
  );
}