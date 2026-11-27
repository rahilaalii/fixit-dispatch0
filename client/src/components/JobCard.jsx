// Badge colors for each urgency level
const colors = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

// Get a name from an object (works for category, provider or customer)
export const nm = (x) => x?.name || x?.user?.name || "";

export default function JobCard({ job, children }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 mb-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{nm(job.category) || "Job"} - {job.area}</h3>
          <p className="text-sm text-slate-600">{job.description}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${colors[job.urgency] || ""}`}>
          {job.urgency}
        </span>
      </div>
      <p className="text-xs text-slate-500 mt-2">
        {job.address} | {job.scheduledAt && new Date(job.scheduledAt).toLocaleString()}
      </p>
      {job.urgencyReason && (
        <p className="text-xs text-slate-500">Reason: {job.urgencyReason}</p>
      )}
      <p className="text-sm mt-2">
        Status: <b>{job.status}</b>
        {nm(job.provider) && <> | Provider: {nm(job.provider)}</>}
        {nm(job.customer) && <> | Customer: {nm(job.customer)}</>}
      </p>
      {/* Action buttons (children) are added by each page */}
      {children && <div className="mt-3 flex gap-2 flex-wrap items-center">{children}</div>}
    </div>
  );
}