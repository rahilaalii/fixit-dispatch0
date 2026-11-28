import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { pick, msg, call, ENDPOINTS } from "../../api";
import JobCard from "../../components/JobCard";
import { Empty, Hero, Notice, Spinner, StatCard, btn, fmtDate, greeting } from "../../components/ui";
import { useAuth } from "../../AuthContext";

// Star rating shown on completed jobs
function Rate({ job, onDone }) {
  const [stars, setStars] = useState(0);
  const [err, setErr] = useState("");

  async function submit(n) {
    setStars(n);
    try {
      await call(ENDPOINTS.rateJob(job._id), { stars: n });
      onDone();
    } catch (e) {
      setErr(/duplicate/i.test(msg(e)) ? "You already rated this job" : msg(e));
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-500">Rate the service:</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => submit(n)}
          className={`text-2xl leading-none ${n <= stars ? "text-amber-400" : "text-slate-300 hover:text-amber-300"}`}>
          &#9733;
        </button>
      ))}
      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  );
}

const TABS = [
  ["all", "All"],
  ["active", "Active"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
];
const ACTIVE = ["requested", "assigned", "accepted", "in_progress"];

export default function MyJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState(null);
  const [tab, setTab] = useState("all");
  const [error, setError] = useState("");

  const load = () =>
    api.get("/jobs").then((r) => setJobs(pick(r))).catch((e) => setError(msg(e)));
  useEffect(() => { load(); }, []);

  async function cancel(id) {
    if (!confirm("Cancel this job?")) return;
    try {
      await api.patch(`/jobs/${id}/status`, { status: "cancelled" });
      load();
    } catch (e) {
      setError(msg(e));
    }
  }

  if (!jobs && !error) return <Spinner />;
  const list = jobs || [];
  const shown = list.filter((j) =>
    tab === "all" ? true : tab === "active" ? ACTIVE.includes(j.status) : j.status === tab
  );

  // The closest upcoming job that is not finished
  const next = list
    .filter((j) => ACTIVE.includes(j.status) && new Date(j.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0];

  return (
    <>
      <Hero title={`${greeting()}, ${user?.name?.split(" ")[0] || ""}`}
        subtitle={next ? `Next visit: ${fmtDate(next.scheduledAt)} (${next.area})` : "Need something fixed? Book a trusted provider in a minute."}>
        <Link to="/customer/new" className="bg-white text-blue-700 hover:bg-blue-50 rounded-xl px-5 py-2.5 text-sm font-semibold">
          + Book a service
        </Link>
      </Hero>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={"\u{1F4CB}"} label="Total jobs" value={list.length} />
        <StatCard icon={"\u23F3"} iconBg="bg-amber-50" label="Active" value={list.filter((j) => ACTIVE.includes(j.status)).length} tone="text-blue-700" />
        <StatCard icon={"\u2705"} iconBg="bg-emerald-50" label="Completed" value={list.filter((j) => j.status === "completed").length} tone="text-emerald-600" />
      </div>

      {error && <div className="mb-4"><Notice>{error}</Notice></div>}

      <div className="flex gap-2 mb-4">
        {TABS.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-1.5 rounded-full text-sm ${tab === k ? "bg-blue-700 text-white" : "bg-white border border-slate-300 text-slate-600"}`}>
            {label}
          </button>
        ))}
      </div>

      {shown.length === 0 && (
        <Empty title="No jobs here" text="Book your first service and it will appear here." />
      )}
      {shown.map((j) => (
        <JobCard key={j._id} job={j}>
          {j.status === "completed" && <Rate job={j} onDone={load} />}
          {["requested", "assigned", "accepted"].includes(j.status) && (
            <button className={btn.red} onClick={() => cancel(j._id)}>Cancel job</button>
          )}
        </JobCard>
      ))}
    </>
  );
}
