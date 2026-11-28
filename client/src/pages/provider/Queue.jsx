import { useEffect, useState } from "react";
import api, { pick, msg, call, ENDPOINTS } from "../../api";
import JobCard from "../../components/JobCard";
import { Countdown, Empty, Hero, Notice, Spinner, StatCard, btn, greeting } from "../../components/ui";
import { useAuth } from "../../AuthContext";

const TABS = [
  ["new", "Needs response"],
  ["active", "In progress"],
  ["done", "Completed"],
];
const group = (s) =>
  s === "assigned" ? "new" : s === "accepted" || s === "in_progress" ? "active" : s === "completed" ? "done" : "other";

export default function Queue() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState(null);
  const [me, setMe] = useState(null); // provider profile (for the availability switch)
  const [tab, setTab] = useState("new");
  const [error, setError] = useState("");

  const load = () =>
    api.get("/jobs").then((r) => setJobs(pick(r))).catch((e) => setError(msg(e)));

  useEffect(() => {
    load();
    api.get("/providers/me").then((r) => setMe(r.data.provider)).catch(() => {});
    const t = setInterval(load, 15000); // refresh every 15 seconds
    return () => clearInterval(t);
  }, []);

  async function setStatus(id, status) {
    try { await api.patch(`/jobs/${id}/status`, { status }); load(); }
    catch (e) { setError(msg(e)); }
  }
  async function decline(id) {
    if (!confirm("Decline this job? It will be offered to another provider.")) return;
    try { await call(ENDPOINTS.declineJob(id)); load(); }
    catch (e) { setError(msg(e)); }
  }
  async function toggleAvailable() {
    try {
      const r = await api.patch("/providers/me", { isAvailable: !me.isAvailable });
      setMe(r.data.provider);
    } catch (e) { setError(msg(e)); }
  }

  if (!jobs && !error) return <Spinner />;
  const list = jobs || [];
  const count = (g) => list.filter((j) => group(j.status) === g).length;
  const shown = list.filter((j) => group(j.status) === tab);
  const urgentNew = list.filter((j) => j.status === "assigned" && j.urgency === "High").length;

  return (
    <>
      <Hero title={`${greeting()}, ${user?.name?.split(" ")[0] || ""}`}
        subtitle="Most urgent jobs come first. This page updates every 15 seconds.">
        {me && (
          <button onClick={toggleAvailable}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${me.isAvailable ? "bg-white text-emerald-700" : "bg-blue-900/60 text-white"}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${me.isAvailable ? "bg-emerald-500" : "bg-slate-300"}`} />
            {me.isAvailable ? "Available for new jobs" : "Not available"}
          </button>
        )}
      </Hero>

      {urgentNew > 0 && (
        <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 px-5 py-4 flex items-center gap-3">
          <span className="text-2xl">&#128680;</span>
          <p className="font-medium">
            You have {urgentNew} urgent job{urgentNew > 1 ? "s" : ""} waiting. Please respond quickly, or it will go to another provider.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={"\u{1F6A8}"} iconBg="bg-red-50" label="Urgent, waiting" value={urgentNew} tone="text-red-600" />
        <StatCard icon={"\u{1F4E5}"} iconBg="bg-amber-50" label="Needs response" value={count("new")} tone="text-amber-600" />
        <StatCard icon={"\u{1F6E0}\uFE0F"} label="In progress" value={count("active")} tone="text-blue-700" />
        <StatCard icon={"\u2705"} iconBg="bg-emerald-50" label="Completed" value={count("done")} tone="text-emerald-600" />
      </div>

      {error && <div className="mb-4"><Notice>{error}</Notice></div>}

      <div className="flex gap-2 mb-4 flex-wrap">
        {TABS.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-1.5 rounded-full text-sm ${tab === k ? "bg-blue-700 text-white" : "bg-white border border-slate-300 text-slate-600"}`}>
            {label} ({count(k)})
          </button>
        ))}
      </div>

      {shown.length === 0 && <Empty title="Nothing here" text="New jobs will appear automatically." />}
      {shown.map((j) => (
        <JobCard key={j._id} job={j} highlight={j.status === "assigned" && j.urgency === "High"}>
          {j.status === "assigned" && (
            <>
              <button className={btn.green} onClick={() => setStatus(j._id, "accepted")}>Accept</button>
              <button className={btn.red} onClick={() => decline(j._id)}>Decline</button>
              {j.offerExpiresAt && <Countdown until={j.offerExpiresAt} />}
            </>
          )}
          {j.status === "accepted" && (
            <button className={btn.primary} onClick={() => setStatus(j._id, "in_progress")}>Start work</button>
          )}
          {j.status === "in_progress" && (
            <button className={btn.green} onClick={() => setStatus(j._id, "completed")}>Mark completed</button>
          )}
        </JobCard>
      ))}
    </>
  );
}
