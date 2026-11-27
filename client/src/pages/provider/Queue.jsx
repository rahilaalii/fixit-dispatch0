import { useEffect, useState } from "react";
import api, { pick, msg, call, ENDPOINTS } from "../../api";
import JobCard from "../../components/JobCard";

export default function Queue() {
  const [jobs, setJobs] = useState([]);
  const load = () => api.get("/jobs").then((r) => setJobs(pick(r)));

  useEffect(() => {
    load();
    const t = setInterval(load, 15000); // refresh every 15 seconds
    return () => clearInterval(t);
  }, []);

  async function setStatus(id, status) {
    try { await api.patch(`/jobs/${id}/status`, { status }); load(); }
    catch (e) { alert(msg(e)); }
  }
  async function decline(id) {
    try { await call(ENDPOINTS.declineJob(id)); load(); }
    catch (e) { alert(msg(e)); }
  }
  const btn = "text-white px-3 py-1 rounded text-sm";

  return (
    <>
      <h1 className="text-xl font-bold mb-3">My Queue (urgent first)</h1>
      {jobs.length === 0 && <p className="text-slate-500">No jobs.</p>}
      {jobs.map((j) => (
        <JobCard key={j._id} job={j}>
          {j.status === "assigned" && (
            <>
              {j.offerExpiresAt && (
                <span className="text-xs text-red-600">
                  Accept before {new Date(j.offerExpiresAt).toLocaleTimeString()}
                </span>
              )}
              <button className={`${btn} bg-green-600`} onClick={() => setStatus(j._id, "accepted")}>Accept</button>
              <button className={`${btn} bg-red-600`} onClick={() => decline(j._id)}>Decline</button>
            </>
          )}
          {j.status === "accepted" && (
            <button className={`${btn} bg-blue-600`} onClick={() => setStatus(j._id, "in_progress")}>Start</button>
          )}
          {j.status === "in_progress" && (
            <button className={`${btn} bg-indigo-600`} onClick={() => setStatus(j._id, "completed")}>Complete</button>
          )}
        </JobCard>
      ))}
    </>
  );
}