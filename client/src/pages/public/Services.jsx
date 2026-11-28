import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { pick } from "../../api";
import { catIcon } from "../../components/ui";

export default function Services() {
  const [cats, setCats] = useState([]);
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    api.get("/categories").then((r) => setCats(pick(r))).catch(() => {});
    api.get("/public/providers").then((r) => setProviders(pick(r))).catch(() => {});
  }, []);

  // How many technicians offer each service
  const countFor = (id) => providers.filter((p) => p.categories?.some((c) => c._id === id)).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">Our services</h1>
      <p className="text-slate-500 mt-1 mb-8">Everything for your home, from one place.</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cats.map((c) => (
          <div key={c._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">{catIcon(c.name)}</div>
            <h3 className="text-lg font-semibold mt-4">{c.name}</h3>
            <p className="text-sm text-slate-500 mt-1 flex-1">{c.description}</p>
            <p className="text-xs text-slate-400 mt-3">{countFor(c._id)} technicians available</p>
            <div className="flex gap-2 mt-4">
              <Link to={`/customer/new?category=${c._id}`} className="bg-blue-700 hover:bg-blue-800 text-white rounded-lg px-4 py-2 text-sm font-medium">Book now</Link>
              <Link to={`/providers?category=${c._id}`} className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg px-4 py-2 text-sm font-medium">See technicians</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
