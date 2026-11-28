import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { msg } from "../../api";
import { Empty, Notice, Spinner, Stars, btn, catIcon, fmtMonth } from "../../components/ui";

export default function ProviderProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/public/providers/${id}`).then((r) => setData(r.data)).catch((e) => setError(msg(e)));
  }, [id]);

  if (error) return <div className="max-w-3xl mx-auto px-4 py-10"><Notice>{error}</Notice></div>;
  if (!data) return <div className="max-w-6xl mx-auto px-4 py-10"><Spinner /></div>;

  const { provider: p, reviews } = data;
  const first = p.categories?.[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link to="/providers" className="text-sm text-slate-500 hover:text-slate-800">&larr; All technicians</Link>

      <div className="grid lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 font-bold text-3xl flex items-center justify-center">
                {p.name?.[0]}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{p.name}</h1>
                <p className="mt-1"><Stars value={p.ratingAvg} size="text-xl" /> <b>{p.ratingAvg || "New"}</b>
                  <span className="text-slate-400"> ({p.ratingCount} reviews)</span></p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {p.categories?.map((c) => (
                    <span key={c._id} className="text-xs bg-slate-100 rounded-full px-2.5 py-1">{catIcon(c.name)} {c.name}</span>
                  ))}
                </div>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full ${p.isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {p.isAvailable ? "Available" : "Away"}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-semibold mb-3">About</h2>
            <p className="text-slate-600">{p.skills || "Experienced professional technician."}</p>
            <div className="grid sm:grid-cols-3 gap-4 mt-5 text-sm">
              <div><p className="text-slate-400">Working hours</p><p className="font-medium">{p.workingHours?.start}:00 to {p.workingHours?.end}:00</p></div>
              <div><p className="text-slate-400">Areas served</p><p className="font-medium">{p.areas?.join(", ")}</p></div>
              <div><p className="text-slate-400">With us since</p><p className="font-medium">{fmtMonth(p.memberSince)}</p></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-semibold mb-3">Customer reviews</h2>
            {reviews.length === 0 && <Empty title="No written reviews yet" text="Reviews appear here after customers rate completed jobs." />}
            {reviews.map((r) => (
              <div key={r._id} className="py-4 border-b border-slate-100 last:border-0">
                <div className="flex justify-between">
                  <p className="font-medium">{r.customer}</p>
                  <p className="text-xs text-slate-400">{fmtMonth(r.createdAt)}</p>
                </div>
                <Stars value={r.stars} />
                {r.comment && <p className="text-slate-600 text-sm mt-1">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Booking card */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:sticky lg:top-24">
            <h2 className="font-semibold">Need {first ? `a ${first.name}` : "help"}?</h2>
            <p className="text-sm text-slate-500 mt-1">
              Book a time slot. You will see free technicians for your area and time before you confirm.
            </p>
            <Link to={first ? `/customer/new?category=${first._id}` : "/customer/new"} className={`${btn.primary} block text-center mt-4 py-2.5`}>
              Book a service
            </Link>
            <p className="text-xs text-slate-400 mt-3">You only need to log in when you book.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
