import { useEffect, useState } from "react";
import api, { pick, msg, call, ENDPOINTS } from "../../api";
import JobCard from "../../components/JobCard";

// Small rating widget shown on completed jobs
function Rate({ job, onDone }) {
  const [stars, setStars] = useState(5);
  const [err, setErr] = useState("");

  async function submit() {
    try {
     await call(ENDPOINTS.rateJob(job._id), { stars: Number(stars) });
      onDone();
    } catch (e) {
      setErr(/duplicate/i.test(msg(e)) ? "Already rated" : msg(e));
    }
  }

  return (
    <>
      <select className="border p-1 rounded text-sm" value={stars}
        onChange={(e) => setStars(e.target.value)}>
        {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star</option>)}
      </select>
      <button onClick={submit} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm">
        Rate
      </button>
      {err && <span className="text-red-600 text-xs">{err}</span>}
    </>
  );
}

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const load = () => api.get("/jobs").then((r) => setJobs(pick(r)));
  useEffect(() => { load(); }, []);

  return (
    <>
      <h1 className="text-xl font-bold mb-3">My Jobs</h1>
      {jobs.length === 0 && <p className="text-slate-500">No jobs yet.</p>}
      {jobs.map((j) => (
        <JobCard key={j._id} job={j}>
          {j.status === "completed" && <Rate job={j} onDone={load} />}
        </JobCard>
      ))}
    </>
  );
}