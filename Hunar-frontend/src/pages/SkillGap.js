import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useToast } from "../hooks/useToast";

const API_BASE = "https://localhost:7259/api";
const HUB_URL = "https://localhost:7259/hubs/skillgap";

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

export default function SkillGap() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [progress, setProgress] = useState(0);

  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState(location.state?.jobId || "");
  const [jobDropdownOpen, setJobDropdownOpen] = useState(false);
  const [jobSearch, setJobSearch] = useState("");

  const connectionRef = useRef(null);
  const fileInputRef = useRef(null);
  const jobDropdownRef = useRef(null);

  const selectedJob = jobs.find((j) => j.id === selectedJobId);
  const jobTitle = selectedJob?.title || location.state?.jobTitle || "";

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(`${API_BASE}/jobs?page=1&pageSize=50`);
        setJobs(res.data.items || []);
      } catch (err) {
        toast.error("Failed to load jobs list");
      } finally {
        setJobsLoading(false);
      }
    };
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (jobDropdownRef.current && !jobDropdownRef.current.contains(e.target)) {
        setJobDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizeValue = (value) => {
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    if (Array.isArray(value)) return value.join(", ");
    if (value && typeof value === "object") {
      if (typeof value.name === "string") return value.name;
      if (typeof value.skill === "string") return value.skill;
      if (typeof value.skill_name === "string") return value.skill_name;
      if (typeof value.skillName === "string") return value.skillName;
      if (typeof value.value === "string") return value.value;
      if (typeof value.title === "string") return value.title;
      if (typeof value.label === "string") return value.label;
      if (typeof value?.skill?.name === "string") return value.skill.name;
      if (typeof value?.skill?.skill_name === "string") return value.skill.skill_name;
      const firstString = Object.values(value).find((child) => typeof child === "string");
      return firstString ?? JSON.stringify(value);
    }
    return String(value);
  };

  const normalizeList = (items) => {
    if (!items) return [];
    if (!Array.isArray(items)) return [];

    return items
      .map((item) => normalizeValue(item))
      .filter((item) => item !== "" && item !== "undefined");
  };

  const normalizeAnalysisResult = (raw) => {
    const data =
      raw?.analysisResult ?? raw?.analysis_result ?? raw?.result ?? raw?.data ?? raw;

    const matchedSkills = normalizeList(data?.matched_skills ?? data?.matchedSkills);
    const missingSkills = normalizeList(data?.missing_skills ?? data?.missingSkills);

    return {
      matchPercentage:
        data?.match_percentage ?? data?.matchPercentage ?? null,
      totalSkills:
        data?.total_skills ?? data?.totalSkills ?? matchedSkills.length + missingSkills.length,
      matchedSkills,
      missingSkills,
      suggestedResources: data?.suggested_resources ?? data?.suggestedResources ?? [],
    };
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFileName(selectedFile.name);
      setFile(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedJobId) {
      toast.error("Please select a job first");
      return;
    }

    if (!file) {
      toast.error("Please select a resume (PDF) first");
      return;
    }

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "Candidate" || isTokenExpired(token)) {
      toast.error("Your session has expired. Please log in again.");
      navigate("/login");
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);

    try {
      const connectionId = `analysis-${Date.now()}`;

      const { HubConnectionBuilder } = await import("@microsoft/signalr");
      const connection = new HubConnectionBuilder()
        .withUrl(HUB_URL, { accessTokenFactory: () => token })
        .withAutomaticReconnect()
        .build();

      connection.on("AnalysisProgress", (data) => {
        setProgress(data.progress);
      });

      connectionRef.current = connection;
      await connection.start();

      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await axios.post(`${API_BASE}/files/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const cvFilePath = uploadRes.data.filePath;

      const analysisRes = await axios.post(
        `${API_BASE}/skillgap`,
        { jobId: selectedJobId, cvFilePath, connectionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const normalized = normalizeAnalysisResult(analysisRes.data);

      setAnalysisResult(normalized);
      setProgress(100);
      toast.success("Analysis complete!");
    } catch (err) {
      console.error("Analysis error:", err);
      toast.error("Failed to analyze resume. Please try again.");
      setIsAnalyzing(false);
    } finally {
      if (connectionRef.current) {
        await connectionRef.current.stop();
      }
    }
  };

  const handleViewReport = () => {
    navigate("/skill-gap-report", {
      state: {
        analysisResult,
        jobTitle: jobTitle || "Job Position",
        suggestedResources: analysisResult?.suggestedResources || [],
      },
    });
  };

  const filteredJobOptions = jobs.filter((j) =>
    j.title.toLowerCase().includes(jobSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-cream px-6 py-8 md:px-12">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/jobs")}
          className="text-sm text-stone hover:text-ink mb-6"
        >
          ? Back to Jobs
        </button>

        <h1 className="text-3xl font-bold text-ink mb-2">Analyze Your Fit</h1>
        <p className="text-sm text-stone mb-8">
          Upload your resume and pick a job to see how well you match.
        </p>

        {!analysisResult ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-sand rounded-md p-8"
          >
            <h2 className="text-lg font-semibold text-ink mb-6">Compare against</h2>

            <p className="text-sm font-medium text-ink mb-2">Select Job</p>
            <div ref={jobDropdownRef} className="relative mb-6">
              <button
                type="button"
                disabled={jobsLoading}
                onClick={() => setJobDropdownOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-3 border border-sand rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-60"
              >
                <span className={`truncate text-left ${selectedJob ? "text-ink" : "text-stone"}`}>
                  {jobsLoading
                    ? "Loading jobs..."
                    : selectedJob
                    ? selectedJob.title
                    : "Choose a job to analyze against"}
                </span>
                <span className="text-stone shrink-0">{jobDropdownOpen ? "▲" : "▼"}</span>
              </button>

              {jobDropdownOpen && !jobsLoading && (
                <div className="absolute z-20 mt-2 w-full bg-white border border-sand rounded-lg shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-sand">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search jobs..."
                      value={jobSearch}
                      onChange={(e) => setJobSearch(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-sand rounded-md focus:outline-none focus:ring-2 focus:ring-gold/30"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {filteredJobOptions.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-stone">No jobs match your search.</p>
                    ) : (
                      filteredJobOptions.map((job) => (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() => {
                            setSelectedJobId(job.id);
                            setJobDropdownOpen(false);
                            setJobSearch("");
                          }}
                          className={`w-full text-left px-4 py-2.5 hover:bg-sand/20 transition-colors ${
                            job.id === selectedJobId ? "bg-gold/10" : ""
                          }`}
                        >
                          <p className="text-sm text-ink truncate">{job.title}</p>
                          <p className="text-xs text-stone truncate">{job.location}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <p className="text-sm font-medium text-ink mb-4">Select Resume</p>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-sand rounded-lg p-8 text-center cursor-pointer hover:bg-sand/10 transition-colors mb-6"
            >
              <input
                type="file"
                accept="application/pdf"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
              {fileName ? (
                <div>
                  <p className="text-ink font-medium">{fileName}</p>
                  <p className="text-xs text-stone">
                    Click to choose a different file
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-ink font-medium mb-1">Drop your resume here</p>
                  <p className="text-xs text-stone">or click to browse (PDF only)</p>
                </div>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!file || !selectedJobId || isAnalyzing}
              className="w-full bg-gold hover:bg-purple2 text-white font-medium py-3 rounded-lg disabled:opacity-60 transition-colors"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze skill gap"}
            </button>

            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <p className="text-xs text-stone mb-2">{progress}% complete</p>
                <div className="w-full bg-sand/30 rounded-full h-2">
                  <motion.div
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    className="bg-gold h-2 rounded-full"
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-sand rounded-md p-8"
          >
            <h2 className="text-lg font-semibold text-ink mb-6">Analysis complete!</h2>

            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
              <div>
                <p className="text-4xl font-bold text-gold mb-2">
                  {analysisResult.matchPercentage ?? 72}%
                </p>
                <p className="text-sm text-stone">Match Score</p>
              </div>

              <div className="mt-4 md:mt-0 text-center md:text-right">
                <p className="text-sm text-ink mb-1">
                  <span className="font-medium">
                    {analysisResult.matchedSkills?.length ?? 0}
                  </span>{" "}
                  matched skills
                </p>
                <p className="text-sm text-stone">
                  <span className="font-medium">
                    {analysisResult.missingSkills?.length ?? 0}
                  </span>{" "}
                  skills to develop
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <p className="text-xs text-stone mb-1">Matched Skills</p>
                <div className="flex flex-wrap gap-2">
                  {(analysisResult.matchedSkills || [])
                    .slice(0, 3)
                    .map((skill, i) => (
                      <span
                        key={i}
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  {(analysisResult.matchedSkills?.length || 0) > 3 && (
                    <span className="text-xs text-stone">
                      +{analysisResult.matchedSkills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-stone mb-1">Missing Skills</p>
                <div className="flex flex-wrap gap-2">
                  {(analysisResult.missingSkills || []).map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {analysisResult.suggestedResources?.length > 0 && (
              <div className="mb-8">
                <p className="text-xs text-stone mb-3">Suggested resources to close the gap</p>
                <div className="space-y-2">
                  {analysisResult.suggestedResources.slice(0, 3).map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block border border-sand rounded-lg p-3 hover:bg-sand/10 transition-colors"
                    >
                      <p className="text-sm font-medium text-ink">
                        {res.resource_title}{" "}
                        <span className="text-xs text-stone font-normal">— {res.provider}</span>
                      </p>
                      <p className="text-xs text-stone mt-0.5">for {res.skill}</p>
                    </a>
                  ))}
                  {analysisResult.suggestedResources.length > 3 && (
                    <p className="text-xs text-stone">
                      +{analysisResult.suggestedResources.length - 3} more in the full report
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleViewReport}
                className="flex-1 bg-gold hover:bg-purple2 text-white font-medium py-3 rounded-lg transition-colors"
              >
                View Complete Report
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setFileName("");
                  setAnalysisResult(null);
                  setProgress(0);
                }}
                className="flex-1 border border-sand text-ink font-medium py-3 rounded-lg hover:bg-sand/20 transition-colors"
              >
                Upload Another Resume
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}