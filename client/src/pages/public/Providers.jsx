import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { pick, msg } from "../../api";
import ProviderCard from "../../components/ProviderCard";
import { Empty, Notice, Spinner, catIcon, inputCls } from "../../components/ui";

export default function Providers() {
  // The filters live in the address bar, so a filtered page can be shared as a link
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const category = params.get("category") || "";
  const area = params.get("area") || "";
  const sort = params.get("sort") || "rating";

  const [cats, setCats] = useState([]);
  const [areas, setAreas] = useState([]);
  const [list, setList] = useState(null);
  const [text, setText] = useState(q);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/categories").then((r) => setCats(pick(r))).catch(() => {});
    api.get("/public/areas").then((r) => setAreas(r.data.areas || [])).catch(() => {});
  }, []);

  // Load providers again whenever a filter changes
  useEffect(() => {
    setError("");
    api.get("/public/providers", { params: { q, category, area, sort } })
      .then((r) => setList(pick(r)))
      .catch((e) => setError(msg(e)));
  }, [q, category, area, sort]);

  function setFilter(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">Find a technician</h1>
      <p className="text-slate-500 mt-1 mb-6">Search by name or skill, or filter by service and area.</p>

      <form onSubmit={(e) => { e.preventDefault(); setFilter("q", text.trim()); }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 grid md:grid-cols-4 gap-3 mb-4">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search name or skill"
          className={`${inputCls} md:col-span-2`} />
        <select value={area} onChange={(e) => setFilter("area", e.target.value)} className={inputCls}>
          <option value="">All areas</option>
          {areas.map((a) => <option key={a}>{a}</option>)}
        </select>
        <select value={sort} onChange={(e) => setFilter("sort", e.target.value)} className={inputCls}>
          <option value="rating">Best rated</option>
          <option value="reviews">Most reviews</option>
        </select>
      </form>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter("category", "")}
          className={`px-4 py-1.5 rounded-full text-sm ${!category ? "bg-blue-700 text-white" : "bg-white border border-slate-300 text-slate-600"}`}>
          All services
        </button>
        {cats.map((c) => (
          <button key={c._id} onClick={() => setFilter("category", c._id)}
            className={`px-4 py-1.5 rounded-full text-sm ${category === c._id ? "bg-blue-700 text-white" : "bg-white border border-slate-300 text-slate-600"}`}>
            {catIcon(c.name)} {c.name}
          </button>
        ))}
      </div>

      {error && <Notice>{error}</Notice>}
      {!list && !error && <Spinner />}
      {list && list.length === 0 && <Empty title="No technicians found" text="Try removing a filter or a different word." />}
      {list && list.length > 0 && (
        <>
          <p className="text-sm text-slate-500 mb-3">{list.length} technician{list.length > 1 ? "s" : ""} found</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((p) => <ProviderCard key={p._id} p={p} />)}
          </div>
        </>
      )}
    </div>
  );
}
