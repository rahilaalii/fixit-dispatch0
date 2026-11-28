import { Link } from "react-router-dom";
import { Stars, catIcon } from "./ui";

// A technician summary card (used on the homepage and the technicians page)
export default function ProviderCard({ p }) {
  return (
    <Link to={`/providers/${p._id}`}
      className="block bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition p-5">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center">
            {p.name?.[0]}
          </div>
          <div>
            <p className="font-semibold leading-tight">{p.name}</p>
            <p className="text-sm text-slate-500">
              <Stars value={p.ratingAvg} /> <b>{p.ratingAvg || "New"}</b>
              <span className="text-slate-400"> ({p.ratingCount})</span>
            </p>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full ${p.isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
          {p.isAvailable ? "Available" : "Away"}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-4">
        {p.categories?.map((c) => (
          <span key={c._id} className="text-xs bg-slate-100 rounded-full px-2.5 py-1">{catIcon(c.name)} {c.name}</span>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-3">
        &#128205; {p.areas?.slice(0, 3).join(", ")}{p.areas?.length > 3 ? ` +${p.areas.length - 3}` : ""}
      </p>
      <p className="text-xs text-slate-500">&#128339; {p.workingHours?.start}:00 to {p.workingHours?.end}:00</p>
    </Link>
  );
}
