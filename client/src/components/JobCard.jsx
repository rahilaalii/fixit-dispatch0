import { useState } from "react";
import { StatusPill, UrgencyBadge, urgencyBar, STATUS_LABEL, catIcon, fmtDate } from "./ui";

// Get a name from an object (works for category, provider or customer)
export const nm = (x) => x?.name || x?.user?.name || "";

const STEPS = ["requested", "assigned", "accepted", "in_progress", "completed"];

// Small progress line: requested -> assigned -> accepted -> in progress -> completed
function Stepper({ status }) {
  if (status === "cancelled") return null;
  const at = STEPS.indexOf(status);
  return (
    <div className="flex items-center mt-4">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${i <= at ? "bg-blue-600" : "bg-slate-200"}`} />
            <span className={`text-[10px] mt-1 whitespace-nowrap ${i <= at ? "text-blue-700 font-medium" : "text-slate-400"}`}>
              {STATUS_LABEL[s].replace("Waiting for provider", "Requested")}
            </span>
          </div>
          {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 mx-1 mb-4 ${i < at ? "bg-blue-600" : "bg-slate-200"}`} />}
        </div>
      ))}
    </div>
  );
}

export default function JobCard({ job, children, highlight, showStepper = true }) {
  const [showHistory, setShowHistory] = useState(false);
  return (
    <div className={`rounded-2xl border border-slate-200 border-l-4 ${urgencyBar(job.urgency)} shadow-sm p-5 mb-4 ${highlight ? "bg-red-50/60" : "bg-white"}`}>
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div className="flex gap-4">
          <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">
            {catIcon(nm(job.category))}
          </div>
          <div>
            <h3 className="font-semibold text-lg leading-tight">
              {nm(job.category) || "Job"} <span className="text-slate-400 font-normal">in</span> {job.area}
            </h3>
            <p className="text-slate-600 mt-1">{job.description}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <UrgencyBadge urgency={job.urgency} />
          <StatusPill status={job.status} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-slate-600 mt-4">
        <p><span className="text-slate-400">&#128339; </span>{fmtDate(job.scheduledAt)}</p>
        {job.address && <p><span className="text-slate-400">&#128205; </span>{job.address}</p>}
        {nm(job.provider) && <p><span className="text-slate-400">&#128119; </span>{nm(job.provider)} {job.provider?.user?.phone && <span className="text-slate-400">({job.provider.user.phone})</span>}</p>}
        {nm(job.customer) && <p><span className="text-slate-400">&#128100; </span>{nm(job.customer)} {job.customer?.phone && <span className="text-slate-400">({job.customer.phone})</span>}</p>}
      </div>

      {showStepper && <Stepper status={job.status} />}

      {job.urgencyReason && (
        <p className="text-xs text-slate-500 mt-3">Why this urgency: {job.urgencyReason}</p>
      )}

      {(children || job.statusHistory?.length > 0) && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2 items-center">
          {children}
          {job.statusHistory?.length > 0 && (
            <button onClick={() => setShowHistory(!showHistory)}
              className="ml-auto text-xs text-slate-500 hover:text-slate-800 underline">
              {showHistory ? "Hide history" : "Show history"}
            </button>
          )}
        </div>
      )}

      {showHistory && (
        <ul className="mt-3 text-xs text-slate-500 space-y-1">
          {job.statusHistory.map((h, i) => (
            <li key={i}>{fmtDate(h.at)}: {STATUS_LABEL[h.status] || h.status}{h.note ? ` (${h.note})` : ""}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
