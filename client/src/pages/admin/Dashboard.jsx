import { useEffect, useState } from "react";
import api, { pick, msg, call, ENDPOINTS } from "../../api";
import { nm } from "../../components/JobCard";
import {
  Empty, Hero, Modal, Notice, Spinner, StatCard, StatusPill, UrgencyBadge, STATUS_LABEL, catIcon, urgencyDot, fmtDate, greeting, btn, inputCls,
} from "../../components/ui";
import { useAuth } from "../../AuthContext";

// A simple horizontal bar list (no chart library needed)
function Bars({ title, items, color = "bg-blue-600" }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-semibold mb-4">{title}</h3>
      {items.length === 0 && <p className="text-sm text-slate-400">No data yet</p>}
      {items.map((i) => (
        <div key={i.label} className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">{i.label}</span>
            <b>{i.value}</b>
          </div>
          <div className="h-2 bg-slate-100 rounded-full">
            <div className={`h-2 rounded-full ${i.color || color}`} style={{ width: `${(i.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const URG_COLOR = { High: "bg-red-500", Medium: "bg-amber-400", Low: "bg-emerald-500" };

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [providers, setProviders] = useState([]);
  const [fStatus, setFStatus] = useState("");
  const [fUrgency, setFUrgency] = useState("");
  const [assigning, setAssigning] = useState(null); // the job being assigned
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");

  function load() {
    api.get("/admin/stats").then((r) => setStats(r.data)).catch((e) => setError(msg(e)));
    api.get("/jobs").then((r) => setJobs(pick(r))).catch((e) => setError(msg(e)));
    api.get("/providers").then((r) => setProviders(pick(r))).catch(() => {});
  }
  useEffect(() => { load(); }, []);

  async function assign(providerId) {
    setModalError("");
    try {
      await call(ENDPOINTS.assignJob(assigning._id), { providerId });
      setAssigning(null);
      load();
    } catch (e) {
      setModalError(msg(e)); // for example: "Provider is already booked at that time"
    }
  }

  if (!stats && !error) return <Spinner />;

  const t = stats?.totals || {};
  const bs = (k) => (stats?.byStatus || []).find((x) => x._id === k)?.count || 0;
  const open = jobs.filter((j) => ["requested", "assigned", "accepted", "in_progress"].includes(j.status));
  const urgentOpen = open.filter((j) => j.urgency === "High").length;

  // Jobs that need the admin: urgent and open, or still without a provider
  const attention = open
    .filter((j) => j.urgency === "High" || j.status === "requested")
    .slice(0, 5);
  const topProviders = [...providers].sort((a, b) => b.ratingAvg - a.ratingAvg).slice(0, 5);

  const shown = jobs.filter((j) => (!fStatus || j.status === fStatus) && (!fUrgency || j.urgency === fUrgency));

  // Only providers who offer this job's category can be assigned
  const candidates = assigning
    ? providers
        .filter((p) => p.categories?.some((c) => (c._id || c) === (assigning.category?._id || assigning.category)))
        .sort((a, b) => b.ratingAvg - a.ratingAvg)
    : [];

  return (
    <>
      <Hero title={`${greeting()}, ${user?.name?.split(" ")[0] || ""}`}
        subtitle="Here is what is happening with your service requests today." />

      {error && <div className="mb-4"><Notice>{error}</Notice></div>}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={"\u{1F4CB}"} label="Total jobs" value={t.jobs ?? 0} />
        <StatCard icon={"\u{1F6A8}"} iconBg="bg-red-50" label="Urgent and open" value={urgentOpen} tone="text-red-600" />
        <StatCard icon={"\u23F3"} iconBg="bg-amber-50" label="Need a provider" value={bs("requested")} tone="text-amber-600" />
        <StatCard icon={"\u{1F477}"} iconBg="bg-indigo-50" label="Providers" value={t.providers ?? 0} />
        <StatCard icon={"\u{1F465}"} iconBg="bg-emerald-50" label="Customers" value={t.customers ?? 0} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold mb-3">Needs your attention</h3>
          {attention.length === 0 && <p className="text-sm text-slate-400">All good. No urgent or unassigned jobs.</p>}
          {attention.map((j) => (
            <div key={j._id} className="flex flex-wrap justify-between items-center gap-2 border border-slate-100 rounded-xl p-3 mb-2">
              <div className="flex items-center gap-3">
                <span className="text-xl">{catIcon(nm(j.category))}</span>
                <div>
                  <p className="text-sm font-medium">{nm(j.category)} in {j.area} <span className="text-slate-400 font-normal">({fmtDate(j.scheduledAt)})</span></p>
                  <p className="text-xs text-slate-500 max-w-md truncate">{j.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <UrgencyBadge urgency={j.urgency} />
                {["requested", "assigned"].includes(j.status) && (
                  <button className={btn.primary} onClick={() => { setModalError(""); setAssigning(j); }}>
                    {j.provider ? "Reassign" : "Assign"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold mb-3">Top rated providers</h3>
          {topProviders.map((p, i) => (
            <div key={p._id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <div>
                  <p className="text-sm font-medium">{nm(p)}</p>
                  <p className="text-xs text-slate-400">{p.categories?.map((c) => c.name).join(", ")}</p>
                </div>
              </div>
              <span className="text-sm font-semibold"><span className="text-amber-500">&#9733;</span> {p.ratingAvg || "New"}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Bars title="Jobs by status"
          items={(stats?.byStatus || []).map((s) => ({ label: STATUS_LABEL[s._id] || s._id, value: s.count }))} />
        <Bars title="Jobs by urgency"
          items={["High", "Medium", "Low"].map((u) => ({
            label: u, value: (stats?.byUrgency || []).find((x) => x._id === u)?.count || 0, color: URG_COLOR[u],
          }))} />
        <Bars title="Jobs by category" color="bg-indigo-500"
          items={(stats?.byCategory || []).map((c) => ({ label: c.name || "Unknown", value: c.count }))} />
      </div>

      <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
        <h2 className="text-lg font-bold">All jobs</h2>
        <div className="flex gap-2">
          <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className={`${inputCls} w-auto`}>
            <option value="">All statuses</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={fUrgency} onChange={(e) => setFUrgency(e.target.value)} className={`${inputCls} w-auto`}>
            <option value="">All urgency</option>
            <option>High</option><option>Medium</option><option>Low</option>
          </select>
        </div>
      </div>

      {shown.length === 0 ? (
        <Empty title="No jobs match" text="Change the filters above." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Job</th>
                <th className="px-4 py-3 font-medium">Urgency</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Provider</th>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {shown.map((j) => (
                <tr key={j._id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-medium">{nm(j.category)} in {j.area}</p>
                    <p className="text-xs text-slate-500 max-w-xs truncate">{j.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${urgencyDot(j.urgency)}`} />
                    <UrgencyBadge urgency={j.urgency} />
                  </td>
                  <td className="px-4 py-3"><StatusPill status={j.status} /></td>
                  <td className="px-4 py-3">{nm(j.customer)}</td>
                  <td className="px-4 py-3">{nm(j.provider) || <span className="text-amber-600">Not assigned</span>}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{fmtDate(j.scheduledAt)}</td>
                  <td className="px-4 py-3">
                    {["requested", "assigned"].includes(j.status) && (
                      <button className={btn.ghost} onClick={() => { setModalError(""); setAssigning(j); }}>
                        {j.provider ? "Reassign" : "Assign"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {assigning && (
        <Modal title={`Assign a provider: ${nm(assigning.category)}`} onClose={() => setAssigning(null)}>
          <p className="text-sm text-slate-500 mb-3">{assigning.area}, {fmtDate(assigning.scheduledAt)}</p>
          {modalError && <div className="mb-3"><Notice>{modalError}</Notice></div>}
          {candidates.length === 0 && <p className="text-sm text-slate-500">No provider offers this service.</p>}
          {candidates.map((p) => (
            <div key={p._id} className="flex justify-between items-center border border-slate-200 rounded-xl p-3 mb-2">
              <div>
                <p className="font-medium">{nm(p)}</p>
                <p className="text-xs text-slate-500">
                  &#9733; {p.ratingAvg || "New"} | {p.workingHours.start}:00 to {p.workingHours.end}:00 | {p.areas.join(", ")}
                </p>
              </div>
              <button className={btn.primary} onClick={() => assign(p._id)}>Assign</button>
            </div>
          ))}
        </Modal>
      )}
    </>
  );
}
