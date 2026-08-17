import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ToastDisplay from "./components/ToastDisplay";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import SkillGap from "./pages/SkillGap";
import SkillGapReport from "./pages/SkillGapReport";
import PostJob from "./pages/PostJob";
import MyApplications from "./pages/MyApplications";
import MyPostedJobs from "./pages/MyPostedJobs";
import JobApplicants from "./pages/JobApplicants";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <ToastDisplay />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:jobId" element={<JobDetail />} />
            <Route path="/skill-gap" element={<SkillGap />} />
            <Route
              path="/skill-gap-report"
              element={
                <ProtectedRoute allowedRoles={["Candidate"]}>
                  <SkillGapReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-applications"
              element={
                <ProtectedRoute allowedRoles={["Candidate"]}>
                  <MyApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/post-job"
              element={
                <ProtectedRoute allowedRoles={["Recruiter"]}>
                  <PostJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-jobs"
              element={
                <ProtectedRoute allowedRoles={["Recruiter"]}>
                  <MyPostedJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-jobs/:jobId/applicants"
              element={
                <ProtectedRoute allowedRoles={["Recruiter"]}>
                  <JobApplicants />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/jobs" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App
