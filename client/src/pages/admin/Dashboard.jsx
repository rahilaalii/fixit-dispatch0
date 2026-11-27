import { useEffect, useState } from "react";
import api, { pick, msg, call, ENDPOINTS } from "../../api";
import JobCard, { nm } from "../../components/JobCard";

// Shows one group of stats (by status, urgency, category...)
function Block({ title, data }) {
  const rows = Array.isArray(data)
    ? data.map((d) => [d._id ?? d.name ?? d.status ?? "?", d.count ?? d.total ?? JSON.stringify(d)])
    : data && typeof data === "object"
    ? Object.entries(data)
    : [[title, data]];
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-semibold mb-2">{title}</h3>
      {rows.map(([k, v], i) => (
        <p key={i} className="text-sm flex justify-between">
          <span>{String(k)}</span>
          <b>{typeof v === "object" ? JSON.stringify(v) : String(v)}</b>
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [jobs, setJobs] = useState([]);
  const [providers, setProviders] = useState([]);

  function load() {
    api.get("/admin/stats").then((r) => setStats(r.data.stats || r.data.data || r.data));
    api.get("/jobs").then((r) => setJobs(pick(r)));
    api.get("/providers").then((r) => setProviders(pick(r)));
  }
  useEffect(() => { load(); }, []);

  async function assign(jobId, providerId) {
    if (!providerId) return;
    try { await call(ENDPOINTS.assignJob(jobId), { providerId }); load(); }
    catch (e) { alert(msg(e)); }
  }

  return (
    <>
      <h1 className="text-xl font-bold mb-3">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {Object.entries(stats)
          .filter(([k]) => k !== "success")
          .map(([k, v]) => <Block key={k} title={k} data={v} />)}
      </div>

      <h2 className="font-bold mb-2">All Jobs</h2>
      {jobs.map((j) => (
        <JobCard key={j._id} job={j}>
          <select className="border p-1 rounded text-sm" defaultValue=""
            onChange={(e) => assign(j._id, e.target.value)}>
            <option value="">Assign provider</option>
            {providers.map((p) => (
              <option key={p._id} value={p._id}>{nm(p) || p._id}</option>
            ))}
          </select>
        </JobCard>
      ))}
    </>
  );
}