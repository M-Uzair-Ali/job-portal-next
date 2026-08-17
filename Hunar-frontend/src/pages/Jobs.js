import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import axios from "axios";
import { useToast } from "../hooks/useToast";

const API_BASE = "https://localhost:7259/api";

function ApplyButton({ job, status, onApply, onRequireLogin }) {
  const fileInputRef = useRef(null);

  const handleClick = (e) => {
    e.stopPropagation();
    if (status === "applied" || status === "already-applied") return;

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "Candidate") {
      onRequireLogin();
      return;
    }

    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onApply(job, file);
    e.target.value = "";
  };

  const labels = {
    idle: "Apply to job",
    uploading: "Uploading resume...",
    applying: "Submitting application...",
    applied: "Applied ✓",
    "already-applied": "Already applied",
    error: "Failed — try again",
  };

  const isDisabled = status === "uploading" || status === "applying" || status === "applied" || status === "already-applied";

  return (
    <>
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={`w-full text-xs font-medium py-2 rounded-lg transition-colors duration-150 ${
          status === "applied" || status === "already-applied"
            ? "bg-sand/50 text-stone cursor-default"
            : status === "error"
            ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
            : "bg-gold hover:bg-purple2 text-white disabled:opacity-60"
        }`}
      >
        {labels[status] || labels.idle}
      </button>
    </>
  );
}

function JobCard({ job, index, onCardClick, applyStatus, onApply, onRequireLogin }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      onClick={onCardClick}
      className="bg-white border border-sand rounded-md p-4 transition-shadow duration-200 hover:shadow-md cursor-pointer flex flex-col h-64"
    >
      {/* Title - Fixed 10 height */}
      <div className="h-10 mb-2">
        <p className="text-sm font-medium text-ink line-clamp-2">{job.title}</p>
      </div>

      {/* Location - Fixed height */}
      <div className="h-5 mb-3">
        <p className="text-xs text-stone line-clamp-1">
          {job.recruiterName} · {job.location}
        </p>
      </div>

      {/* Job type and salary - Fixed height */}
      <div className="h-6 mb-4 flex items-center justify-between">
        <span className="text-xs text-stone">{job.jobType}</span>
        <span className="bg-sand/50 text-gold text-xs font-medium px-2 py-0.5 rounded">
          PKR {job.salary?.toLocaleString()}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Button - Fixed height */}
      <div className="h-10">
        <ApplyButton
          job={job}
          status={applyStatus}
          onApply={onApply}
          onRequireLogin={onRequireLogin}
        />
      </div>
    </motion.div>
  );
}

export default function Jobs() {
  const navigate = useNavigate();
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [minSalary, setMinSalary] = useState(0);
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [applyStatuses, setApplyStatuses] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [jobTypeDropdownOpen, setJobTypeDropdownOpen] = useState(false);

  const locationDropdownRef = useRef(null);
  const jobTypeDropdownRef = useRef(null);
  const JOBS_PER_PAGE = 10;

  const token = localStorage.getItem("token");

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target)) {
        setLocationDropdownOpen(false);
      }
      if (jobTypeDropdownRef.current && !jobTypeDropdownRef.current.contains(e.target)) {
        setJobTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(`${API_BASE}/jobs?page=1&pageSize=50`);
        setJobs(res.data.items);
      } catch (err) {
        toast.error("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [toast]);

  const handleApply = async (job, file) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "Candidate") {
      toast.error("Please log in as a Candidate to apply.");
      navigate("/login");
      return;
    }

    const setStatus = (status) =>
      setApplyStatuses((prev) => ({ ...prev, [job.id]: status }));

    setStatus("uploading");

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
      setStatus("applying");

      await axios.post(
        `${API_BASE}/applications`,
        { jobId: job.id, cvFilePath },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatus("applied");
      toast.success("Application submitted successfully!");
    } catch (err) {
      if (err.response?.status === 409) {
        setStatus("already-applied");
        toast.info("You've already applied to this job");
      } else if (err.response?.status === 401) {
        setStatus("idle");
        toast.error("Please log in as a Candidate first");
      } else if (err.response?.status === 403) {
        setStatus("idle");
        toast.error("Only Candidates can apply to jobs");
      } else {
        setStatus("error");
        toast.error("Failed to apply: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const locationOptions = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.location).filter(Boolean))).sort(),
    [jobs]
  );

  const jobTypeOptions = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.jobType).filter(Boolean))).sort(),
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return jobs.filter(
      (job) =>
        job.salary >= minSalary &&
        (!locationFilter || job.location === locationFilter) &&
        (!jobTypeFilter || job.jobType === jobTypeFilter) &&
        (!query ||
          job.title?.toLowerCase().includes(query) ||
          job.recruiterName?.toLowerCase().includes(query))
    );
  }, [jobs, minSalary, locationFilter, jobTypeFilter, searchQuery]);

  // Reset to page 1 whenever the filtered results change (e.g. salary filter moves)
  useEffect(() => {
    setCurrentPage(1);
  }, [minSalary, jobs]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / JOBS_PER_PAGE));

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * JOBS_PER_PAGE;
    return filteredJobs.slice(start, start + JOBS_PER_PAGE);
  }, [filteredJobs, currentPage]);

  const goToPage = (page) => {
    const clamped = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(clamped);
    // Scroll the job list back into view so the user sees the new page
    document.getElementById("jobs-list-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const stats = useMemo(() => {
    if (jobs.length === 0) return { count: 0, maxSalary: 0 };
    const maxSalary = Math.max(...jobs.map((j) => j.salary || 0));
    return { count: jobs.length, maxSalary };
  }, [jobs]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-stone text-sm">Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream px-6 py-8 md:px-12">

      {!token && (
        <div className="bg-white border border-gold/30 text-ink rounded-md p-4 mb-6">
          <p className="text-sm">
            Browse jobs freely without signing in. Login as a Candidate to apply.
          </p>
        </div>
      )}

      <div className="flex items-center mb-8">
        <div className="relative z-10 flex items-center flex-1 h-14 bg-white rounded-full border border-sand shadow-[0_10px_25px_rgba(80,60,150,0.1)] overflow-hidden">
          <div className="flex items-center justify-center w-14 h-14 shrink-0 bg-gradient-to-br from-[#6c52c9] to-[#533ea3]">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <div className="relative flex-1 h-full">
            <input
              type="text"
              placeholder="Search jobs by title or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading}
              className="w-full h-full pl-4 pr-10 text-sm text-ink bg-transparent outline-none disabled:opacity-60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-ink text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="hidden lg:flex -ml-14 w-48 h-48 shrink-0 rounded-full bg-gradient-to-br from-[#6c52c9] to-[#533ea3] shadow-[0_20px_40px_rgba(83,62,163,0.2)] flex-col justify-center pl-20 pr-6 text-white pointer-events-none">
          <span className="text-sm font-medium tracking-wide mb-2">
            I want to search for
          </span>
          <div className="flex items-baseline gap-1">
            <span className="w-16 h-[2px] bg-white inline-block" />
            <span className="text-lg font-bold leading-none">.</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-ink rounded-md p-4"
        >
          <p className="text-xs text-stone mb-1">Total jobs</p>
          <p className="text-2xl font-medium text-gold">{loading ? "—" : stats.count}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-sand/40 rounded-md p-4"
        >
          <p className="text-xs text-stone mb-1">Top salary</p>
          <p className="text-2xl font-medium text-ink">
            {loading ? "—" : `PKR ${stats.maxSalary?.toLocaleString()}`}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-sand/40 rounded-md p-4"
        >
          <p className="text-xs text-stone mb-1">Analyze your fit</p>
          <p className="text-2xl font-medium text-ink">Skill Gap →</p>
        </motion.div>
      </div>

      {jobs.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-ink">Latest jobs</p>
            <div className="flex gap-2">
              <button
                onClick={scrollPrev}
                className="w-7 h-7 rounded-full border border-sand flex items-center justify-center text-stone hover:bg-white transition-colors duration-150"
              >
                ‹
              </button>
              <button
                onClick={scrollNext}
                className="w-7 h-7 rounded-full border border-sand flex items-center justify-center text-stone hover:bg-white transition-colors duration-150"
              >
                ›
              </button>
            </div>
          </div>
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {jobs.map((job, i) => (
                <div key={job.id} className="w-[240px] flex-shrink-0">
                  <JobCard
                    job={job}
                    index={i}
                    onCardClick={() => navigate(`/jobs/${job.id}`)}
                    applyStatus={applyStatuses[job.id] || "idle"}
                    onApply={handleApply}
                    onRequireLogin={() => {
                      toast.error("Please log in as a Candidate to apply.");
                      navigate("/login");
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
        <div className="bg-white border border-sand rounded-lg p-5 h-fit sticky top-20">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-semibold text-ink">Filters</p>
            {(locationFilter || jobTypeFilter || minSalary > 0 || searchQuery) && (
              <button
                onClick={() => {
                  setMinSalary(0);
                  setLocationFilter("");
                  setJobTypeFilter("");
                  setSearchQuery("");
                }}
                className="text-xs text-gold hover:text-purple2 font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-stone uppercase tracking-wide">
                Min salary
              </label>
              <span className="text-xs font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded">
                PKR {minSalary.toLocaleString()}+
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="500000"
              step="10000"
              value={minSalary}
              onChange={(e) => setMinSalary(Number(e.target.value))}
              className="w-full accent-gold"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-medium text-stone uppercase tracking-wide mb-2">
              Location
            </label>
            <div ref={locationDropdownRef} className="relative">
              <button
                type="button"
                disabled={loading}
                onClick={() => setLocationDropdownOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-2 border border-sand rounded-lg pl-3 pr-3 py-2.5 text-sm bg-cream/50 hover:bg-cream transition-colors focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-60"
              >
                <span className={locationFilter ? "text-ink" : "text-stone"}>
                  {locationFilter || "All locations"}
                </span>
                <span className="text-stone text-xs shrink-0">
                  {locationDropdownOpen ? "▲" : "▼"}
                </span>
              </button>

              {locationDropdownOpen && (
                <div className="absolute z-20 mt-2 w-full bg-white border border-sand rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setLocationFilter("");
                      setLocationDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-sand/20 transition-colors ${
                      !locationFilter ? "bg-gold/10 text-ink font-medium" : "text-ink"
                    }`}
                  >
                    All locations
                  </button>
                  {locationOptions.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setLocationFilter(loc);
                        setLocationDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-sand/20 transition-colors ${
                        loc === locationFilter ? "bg-gold/10 text-ink font-medium" : "text-ink"
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone uppercase tracking-wide mb-2">
              Job type
            </label>
            <div ref={jobTypeDropdownRef} className="relative">
              <button
                type="button"
                disabled={loading}
                onClick={() => setJobTypeDropdownOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-2 border border-sand rounded-lg pl-3 pr-3 py-2.5 text-sm bg-cream/50 hover:bg-cream transition-colors focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-60"
              >
                <span className={jobTypeFilter ? "text-ink" : "text-stone"}>
                  {jobTypeFilter || "All job types"}
                </span>
                <span className="text-stone text-xs shrink-0">
                  {jobTypeDropdownOpen ? "▲" : "▼"}
                </span>
              </button>

              {jobTypeDropdownOpen && (
                <div className="absolute z-20 mt-2 w-full bg-white border border-sand rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setJobTypeFilter("");
                      setJobTypeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-sand/20 transition-colors ${
                      !jobTypeFilter ? "bg-gold/10 text-ink font-medium" : "text-ink"
                    }`}
                  >
                    All job types
                  </button>
                  {jobTypeOptions.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setJobTypeFilter(type);
                        setJobTypeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-sand/20 transition-colors ${
                        type === jobTypeFilter ? "bg-gold/10 text-ink font-medium" : "text-ink"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <p id="jobs-list-top" className="text-sm font-medium text-ink mb-4 scroll-mt-6">
            {loading ? "Loading..." : `${filteredJobs.length} job${filteredJobs.length !== 1 ? "s" : ""} found`}
          </p>

          {!loading && filteredJobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-stone bg-white border border-sand rounded-md p-6 text-center"
            >
              No jobs match these filters. Try lowering the threshold.
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading
                  ? Array(6).fill(0).map((_, i) => (
                      <div key={i} className="bg-white border border-sand rounded-md p-4 h-48 animate-pulse" />
                    ))
                  : paginatedJobs.map((job, i) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        index={i}
                        onCardClick={() => navigate(`/jobs/${job.id}`)}
                        applyStatus={applyStatuses[job.id] || "idle"}
                        onApply={handleApply}
                      />
                    ))}
              </div>

              {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-8 h-8 rounded-full border border-sand flex items-center justify-center text-stone hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    ‹
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-8 h-8 rounded-full text-xs font-medium transition-colors duration-150 ${
                        page === currentPage
                          ? "bg-gold text-white"
                          : "border border-sand text-stone hover:bg-white"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 rounded-full border border-sand flex items-center justify-center text-stone hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}