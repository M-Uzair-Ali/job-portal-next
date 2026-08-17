import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

/* ---------- small icons (inline svg, no deps) ---------- */

const Arrow = ({ light = false }) => (
  <svg
    className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M4 10h11M10 5l5 5-5 5"
      stroke={light ? "#fff" : "currentColor"}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Check = ({ className = "h-3.5 w-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ---------- shared scroll-reveal wrapper ---------- */

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Kicker({ children }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-gold">
      <span className="h-1.5 w-1.5 rounded-full bg-gold" />
      {children}
    </span>
  );
}

/* ---------- hero visual: the AI skill-match orbit ---------- */

const skillChips = [
  { label: "React", top: "6%", left: "12%", delay: 0 },
  { label: "SQL", top: "18%", left: "78%", delay: 0.6 },
  { label: "Figma", top: "68%", left: "82%", delay: 1.2 },
  { label: "Python", top: "82%", left: "20%", delay: 0.3 },
  { label: "Excel", top: "40%", left: "2%", delay: 0.9 },
];

function SkillOrbit() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[380px]">
      {/* dashed orbit rings */}
      <div className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-ink/15" />
      <div className="absolute inset-[12%] animate-spin-slow-reverse rounded-full border border-dashed border-gold/25" />

      {/* pulsing glow behind the core */}
      <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 animate-pulse-ring rounded-full bg-gold/40" />

      {/* core match card */}
      <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-ink text-cream shadow-xl">
        <span className="font-display text-2xl font-extrabold text-gold">92%</span>
        <span className="mt-0.5 text-[10px] uppercase tracking-wide text-cream/60">Skill match</span>
      </div>

      {/* floating skill chips */}
      {skillChips.map((s) => (
        <div
          key={s.label}
          className="absolute animate-float rounded-full border border-sand bg-white px-3 py-1.5 text-xs font-medium text-ink shadow-sm"
          style={{ top: s.top, left: s.left, animationDelay: `${s.delay}s` }}
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-mint/40 text-mint">
              <Check className="h-2 w-2" />
            </span>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------- testimonials ---------- */

const testimonials = [
  {
    quote:
      "The skill gap report told me exactly which two courses to finish before I applied. I heard back from three recruiters that same week.",
    name: "Hina Aslam",
    role: "Frontend Developer, hired via HunarAI",
  },
  {
    quote:
      "We used to sift through fifty CVs for every role. Now applicants arrive pre-matched to what the job actually needs.",
    name: "Bilal Farooq",
    role: "Talent Lead, Meridian Software",
  },
  {
    quote:
      "Posting a role took less time than writing the job ad usually does. The applicant tracker kept our whole team aligned.",
    name: "Sara Qureshi",
    role: "Founder, Brightpath Studio",
  },
];

function QuoteCard({ item }) {
  return (
    <div className="rounded-2xl border border-sand bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-3 font-display text-3xl leading-none text-gold">&ldquo;</div>
      <p className="text-sm leading-relaxed text-ink sm:text-base">{item.quote}</p>
      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sand text-xs font-semibold text-ink">
          {item.name.split(" ").map((x) => x[0]).join("")}
        </div>
        <div className="text-sm">
          <p className="font-medium text-ink">{item.name}</p>
          <p className="text-xs text-stone">{item.role}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function Home() {
  const navigate = useNavigate();
  const [testimonial, setTestimonial] = useState(0);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <div className="bg-cream">
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden px-6 pb-16 pt-14 md:px-12 md:pb-24 md:pt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Kicker>AI-matched hiring for Pakistan</Kicker>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Where skills meet <br className="hidden sm:block" />
              the right <span className="text-gold">opportunity.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-stone">
              HunarAI reads the job, reads your resume, and shows you exactly what
              matches and what's missing so candidates apply with confidence and
              recruiters review with less noise.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/jobs")}
                className="group inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-purple2"
              >
                Browse jobs <Arrow light />
              </button>
              <button
                onClick={() => navigate("/skill-gap")}
                className="group inline-flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-6 py-3 text-sm font-semibold text-ink transition-colors duration-150 hover:border-ink/30"
              >
                Check your skill gap <Arrow />
              </button>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-stone">
              <span className="inline-flex items-center gap-1.5">
                <Check className="text-gold" /> Free to browse, no signup needed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="text-gold" /> Resume-based AI skill matching
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <SkillOrbit />
          </motion.div>
        </div>
      </section>

      {/* ---------------- TRUST STRIP ---------------- */}
      <section className="border-y border-sand bg-white px-6 py-8 md:px-12">
        <Reveal className="mx-auto flex max-w-6xl flex-col items-center gap-5 sm:flex-row sm:justify-between">
          <p className="whitespace-nowrap text-xs font-medium uppercase tracking-wide text-stone">
            Hiring teams building with HunarAI
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-stone/70">
            {["MERIDIAN", "arcline", "COBALT", "brightpath", "kestrel°", "novaworks"].map((n) => (
              <span key={n} className="font-display text-sm font-bold tracking-tight">
                {n}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ---------------- FEATURE INTRO ---------------- */}
      <section className="px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="max-w-2xl">
            <Kicker>A better way to hire and get hired</Kicker>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Everything both sides of the table actually need.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-stone">
              One platform for finding roles that fit, understanding what's missing,
              and getting applications in front of the right recruiter fast.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              {
                n: "01",
                title: "Search smarter",
                text: "Filter live roles by salary, type, and location updated the moment recruiters post them.",
              },
              {
                n: "02",
                title: "Know your gap",
                text: "Upload your resume against a listing and get a clear breakdown of matched and missing skills.",
              },
              {
                n: "03",
                title: "Apply in one click",
                text: "Submit your CV straight from a job card and track every application's status in one place.",
              },
            ].map((f, i) => (
              <Reveal key={f.n} delay={i * 0.1}>
                <article className="h-full rounded-2xl border border-sand bg-white p-6 transition-shadow duration-200 hover:shadow-md">
                  <span className="text-xs font-semibold text-stone/60">{f.n}</span>
                  <h3 className="mt-3 font-display text-lg font-bold text-ink">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone">{f.text}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15} className="mt-10">
            <QuoteCard item={testimonials[testimonial]} />
            <div className="mt-4 flex justify-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Show testimonial ${i + 1}`}
                  onClick={() => setTestimonial(i)}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    i === testimonial ? "w-6 bg-gold" : "w-1.5 bg-sand"
                  }`}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="bg-ink px-6 py-20 text-cream md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-mint">
              <span className="h-1.5 w-1.5 rounded-full bg-mint" /> How it works
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              From resume to offer, in three steps.
            </h2>
          </Reveal>

          <div className="mt-14 space-y-16">
            {[
              {
                num: "01",
                title: "Create your profile",
                text: "Sign up as a candidate or recruiter and set up your profile in minutes no long forms.",
                preview: (
                  <div className="space-y-2.5">
                    {["Full name", "Headline", "Resume (PDF)"].map((row) => (
                      <div key={row} className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3 text-xs">
                        <span className="text-cream/60">{row}</span>
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-mint/20 text-mint">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                num: "02",
                title: "Get matched, see the gap",
                text: "Our engine compares your resume against a listing's requirements and shows exactly what to close.",
                preview: (
                  <div className="space-y-3">
                    {[
                      { label: "React", pct: 95 },
                      { label: "TypeScript", pct: 70 },
                      { label: "GraphQL", pct: 35 },
                    ].map((s) => (
                      <div key={s.label} className="text-xs">
                        <div className="mb-1 flex justify-between text-cream/60">
                          <span>{s.label}</span>
                          <span>{s.pct}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-gold" style={{ width: `${s.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                num: "03",
                title: "Apply and track",
                text: "Submit applications straight from the job listing and follow their status until you hear back.",
                preview: (
                  <div className="space-y-2.5">
                    {[
                      { label: "Frontend Engineer · Meridian", status: "Under review" },
                      { label: "Product Designer · Arcline", status: "Applied ✓" },
                    ].map((row) => (
                      <div key={row.label} className="rounded-lg bg-white/5 px-4 py-3 text-xs">
                        <p className="text-cream/80">{row.label}</p>
                        <p className="mt-1 text-mint">{row.status}</p>
                      </div>
                    ))}
                  </div>
                ),
              },
            ].map((step, i) => (
              <Reveal key={step.num}>
                <div
                  className={`grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-14 ${
                    i % 2 ? "md:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <div>
                    <span className="font-display text-sm font-bold text-cream/40">{step.num}</span>
                    <h3 className="mt-2 font-display text-2xl font-bold">{step.title}</h3>
                    <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream/60">{step.text}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="mb-4 flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                      <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                      <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    </div>
                    {step.preview}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FOR RECRUITERS ---------------- */}
      <section className="px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="max-w-2xl">
            <Kicker>Built for hiring teams too</Kicker>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Post once, review with confidence.
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              { title: "Post a job in minutes", text: "Write the role, set the salary band, publish it's live for candidates immediately." },
              { title: "Review applicants in one place", text: "See every applicant's resume and skill match side by side, no inbox digging." },
              { title: "Hire with confidence", text: "Spend your time on the candidates who are genuinely closest to what the role needs." },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 0.1}>
                <article className="group h-full overflow-hidden rounded-2xl border border-sand bg-white transition-shadow duration-200 hover:shadow-md">
                  <div
                    className="flex h-32 items-center justify-center text-sm font-semibold uppercase tracking-wide text-white/90"
                    style={{
                      background: [
                        "linear-gradient(135deg,#7965F5,#B78CFF)",
                        "linear-gradient(135deg,#0A0A0A,#4b4b52)",
                        "linear-gradient(135deg,#8EE6D0,#5fb8a3)",
                      ][i],
                    }}
                  >
                    HunarAI
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-lg font-bold text-ink">{c.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone">{c.text}</p>
                    <button
                      onClick={() => navigate("/post-job")}
                      className="group/btn mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold"
                    >
                      Post a job <Arrow />
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- STATS ---------------- */}
      <section className="bg-sand/40 px-6 py-20 md:px-12 md:py-28">
        <Reveal className="mx-auto max-w-6xl">
          <Kicker>Since launch</Kicker>
          <h2 className="mt-3 max-w-xl font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Built to grow with every job posted.
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { value: "50+", label: "active job listings" },
              { value: "2", label: "role types: Candidate & Recruiter" },
              { value: "1-click", label: "resume-based applications" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-4xl font-extrabold text-ink">
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-stone">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <section className="px-6 py-20 md:px-12 md:py-28">
        <Reveal className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 rounded-3xl bg-ink px-8 py-12 text-cream sm:px-12 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready to find your <span className="text-gold">next move?</span>
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-cream/60">
              Get notified when a new listing matches your skills no spam, just relevant roles.
            </p>
          </div>

          <form onSubmit={submit} className="w-full max-w-sm shrink-0">
            <label className="mb-2 block text-xs font-medium text-cream/60">Email address</label>
            <div className="flex overflow-hidden rounded-lg border border-white/15 bg-white/5">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent px-4 py-3 text-sm text-cream placeholder:text-cream/30 focus:outline-none"
              />
              <button
                type="submit"
                className="flex shrink-0 items-center gap-1.5 bg-gold px-5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-purple2"
              >
                {submitted ? "You're in ✓" : "Notify me"}
              </button>
            </div>
            {submitted && <p className="mt-2 text-xs text-mint">Thanks we'll email you when a match comes up.</p>}
          </form>
        </Reveal>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="border-t border-sand bg-white px-6 pt-16 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
            <div>
              <Link to="/" className="flex items-center gap-2">
                <span className="flex h-[22px] w-[22px] items-end gap-[2px]">
                  <span className="block w-[5px] rounded-t-sm bg-ink" style={{ height: "10px" }} />
                  <span className="block w-[5px] rounded-t-sm bg-ink" style={{ height: "17px" }} />
                  <span className="block w-[5px] rounded-t-sm bg-ink" style={{ height: "13px" }} />
                </span>
                <span className="font-display text-lg font-extrabold uppercase tracking-tight text-ink">
                  HunarAI<span className="text-gold">.</span>
                </span>
              </Link>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-stone">
                AI-matched hiring for candidates and recruiters across Pakistan.
              </p>
              <div className="mt-5 flex gap-3">
                {["in", "x", "gh"].map((s) => (
                  <a
                    key={s}
                    href="#top"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-sand text-xs text-stone transition-colors duration-150 hover:border-gold hover:text-gold"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink">Platform</p>
              <ul className="space-y-2.5 text-sm text-stone">
                <li><Link to="/jobs" className="hover:text-gold">Browse jobs</Link></li>
                <li><Link to="/skill-gap" className="hover:text-gold">Skill gap analysis</Link></li>
                <li><Link to="/my-applications" className="hover:text-gold">My applications</Link></li>
              </ul>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink">Recruiters</p>
              <ul className="space-y-2.5 text-sm text-stone">
                <li><Link to="/post-job" className="hover:text-gold">Post a job</Link></li>
                <li><Link to="/my-jobs" className="hover:text-gold">Manage listings</Link></li>
                <li><Link to="/register" className="hover:text-gold">Create an account</Link></li>
              </ul>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink">Company</p>
              <ul className="space-y-2.5 text-sm text-stone">
                <li><a href="#top" className="hover:text-gold">About</a></li>
                <li><a href="#top" className="hover:text-gold">Privacy</a></li>
                <li><a href="#top" className="hover:text-gold">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-sand py-6 text-xs text-stone sm:flex-row">
            <span>© {new Date().getFullYear()} HunarAI. All rights reserved.</span>
            <span>Made for candidates and recruiters who value fit over noise.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
