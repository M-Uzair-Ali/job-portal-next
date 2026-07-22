import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import SkillGap from "./pages/SkillGap";
import PostJob from "./pages/PostJob";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <Jobs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/skill-gap"
            element={
              <ProtectedRoute allowedRoles={["Candidate"]}>
                <SkillGap />
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;