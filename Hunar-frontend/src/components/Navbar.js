import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setMenuOpen(false);
    navigate("/jobs");
  };

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const linkClass = (path) =>
    `text-sm transition-colors duration-150 ${
      location.pathname === path
        ? "text-white"
        : "text-white/60 hover:text-white"
    }`;

  const links = [
    { to: "/", label: "Home" },
    { to: "/jobs", label: "Jobs" },
    ...(role === "Candidate"
      ? [
          { to: "/skill-gap", label: "Skill Gap" },
          { to: "/my-applications", label: "My Applications" },
        ]
      : []),
    ...(role === "Recruiter"
      ? [
          { to: "/post-job", label: "Post Job" },
          { to: "/my-jobs", label: "My Jobs" },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink">
      <div className="flex h-[76px] items-center px-5 sm:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 whitespace-nowrap"
          onClick={() => setMenuOpen(false)}
        >
          <span className="flex h-[22px] w-[22px] items-end gap-[2px]">
            <span className="block w-[5px] rounded-t-sm bg-white" style={{ height: "10px" }} />
            <span className="block w-[5px] rounded-t-sm bg-white" style={{ height: "17px" }} />
            <span className="block w-[5px] rounded-t-sm bg-white" style={{ height: "13px" }} />
          </span>
          <span className="font-display text-lg font-extrabold uppercase tracking-tight text-white">
            HunarAI<span className="text-mint">.</span>
          </span>
        </Link>

        <nav className="mx-auto hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className={linkClass(l.to)}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-6 md:flex">
          {token ? (
            <button
              onClick={handleLogout}
              className="text-sm text-white/60 transition-colors duration-150 hover:text-white"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className={linkClass("/login")}>
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-white/90"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((v) => !v)}
          className="ml-auto flex flex-col gap-[5px] p-1 md:hidden"
        >
          <span className="block h-[2px] w-[22px] bg-white" />
          <span className="block h-[2px] w-[22px] bg-white" />
          <span className="block h-[2px] w-[22px] bg-white" />
        </button>
      </div>

      {menuOpen && (
        <div className="flex flex-col gap-1 border-t border-white/10 bg-ink px-5 py-4 md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className={`py-2.5 text-sm ${linkClass(l.to)}`}
            >
              {l.label}
            </Link>
          ))}
          {token ? (
            <button
              onClick={handleLogout}
              className="py-2.5 text-left text-sm text-white/60 hover:text-white"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="py-2.5 text-sm text-white/60 hover:text-white"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-md bg-white px-5 py-2.5 text-center text-sm font-semibold text-ink"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
