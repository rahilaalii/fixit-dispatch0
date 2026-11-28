// Small reusable pieces used by all pages (badges, cards, modal...)
import { useEffect, useState } from "react";

export const STATUS_LABEL = {
  requested: "Waiting for provider",
  assigned: "Assigned",
  accepted: "Accepted",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_STYLE = {
  requested: "bg-slate-100 text-slate-700",
  assigned: "bg-amber-100 text-amber-800",
  accepted: "bg-blue-100 text-blue-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
};

const URGENCY = {
  High: { bar: "border-l-red-500", badge: "bg-red-100 text-red-700", dot: "bg-red-500" },
  Medium: { bar: "border-l-amber-400", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-400" },
  Low: { bar: "border-l-emerald-500", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
};

export const urgencyBar = (u) => URGENCY[u]?.bar || "border-l-slate-300";
export const urgencyDot = (u) => URGENCY[u]?.dot || "bg-slate-300";

export function StatusPill({ status }) {
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[status] || "bg-slate-100"}`}>
      {STATUS_LABEL[status] || status}
    </span>
  );
}

export function UrgencyBadge({ urgency }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${URGENCY[urgency]?.badge || "bg-slate-100"}`}>
      {urgency} urgency
    </span>
  );
}

// A number card for dashboards (with an optional icon)
export function StatCard({ label, value, hint, tone = "text-slate-900", icon, iconBg = "bg-blue-50" }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
      {icon && (
        <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-2xl ${iconBg}`}>{icon}</div>
      )}
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className={`text-3xl font-bold ${tone}`}>{value}</p>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

// Big blue welcome banner at the top of each dashboard
export function Hero({ title, subtitle, children }) {
  return (
    <div className="relative overflow-hidden bg-blue-700 text-white rounded-3xl p-6 sm:p-8 mb-6">
      <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-blue-600/60" />
      <div className="absolute right-24 -bottom-16 w-40 h-40 rounded-full bg-orange-400/30" />
      <div className="relative flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
          {subtitle && <p className="text-blue-100 mt-1">{subtitle}</p>}
        </div>
        <div className="flex gap-3 items-center">{children}</div>
      </div>
    </div>
  );
}

export function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

// Emoji icon for each service category
export function catIcon(name = "") {
  const n = name.toLowerCase();
  if (n.includes("plumb")) return "\u{1F527}";
  if (n.includes("electric")) return "\u26A1";
  if (n.startsWith("ac")) return "\u2744\uFE0F";
  if (n.includes("appliance")) return "\u{1F9FA}";
  if (n.includes("carpent")) return "\u{1FA9A}";
  if (n.includes("paint")) return "\u{1F3A8}";
  return "\u{1F6E0}\uFE0F";
}

export function Empty({ title, text }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
      <p className="font-semibold text-slate-700">{title}</p>
      {text && <p className="text-sm text-slate-500 mt-1">{text}</p>}
    </div>
  );
}

export function Notice({ type = "error", children }) {
  const style = type === "error"
    ? "bg-red-50 text-red-700 border-red-200"
    : "bg-emerald-50 text-emerald-700 border-emerald-200";
  return <div className={`text-sm rounded-lg border p-3 ${style}`}>{children}</div>;
}

export function Spinner({ text = "Loading..." }) {
  return <p className="text-slate-500 text-sm py-6">{text}</p>;
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">x</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Shows how much time is left to accept a High urgency job
export function Countdown({ until }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = new Date(until).getTime() - now;
  if (left <= 0) return <span className="text-xs font-semibold text-red-600">Time is over, job will be reassigned</span>;
  const m = Math.floor(left / 60000);
  const s = Math.floor((left % 60000) / 1000);
  return (
    <span className="text-xs font-semibold text-red-600">
      Accept within {m}:{String(s).padStart(2, "0")}
    </span>
  );
}

export const btn = {
  primary: "bg-blue-700 hover:bg-blue-800 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50",
  green: "bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50",
  red: "bg-white border border-red-300 text-red-600 hover:bg-red-50 rounded-lg px-4 py-2 text-sm font-medium",
  ghost: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg px-4 py-2 text-sm font-medium",
};

export const inputCls =
  "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

// Five stars filled according to a rating (for example 4.6)
export function Stars({ value = 0, size = "text-base" }) {
  return (
    <span className={`${size} tracking-tight`} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(value) ? "text-amber-400" : "text-slate-300"}>&#9733;</span>
      ))}
    </span>
  );
}

export const fmtMonth = (d) =>
  d ? new Date(d).toLocaleDateString([], { month: "short", year: "numeric" }) : "";
