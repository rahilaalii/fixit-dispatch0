import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { pick, msg } from "../../api";
import ProviderCard from "../../components/ProviderCard";
import { Notice, UrgencyBadge, btn, catIcon } from "../../components/ui";

// The heart of our homepage: describe the problem, get the service and urgency
function ProblemBox() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function check(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setBusy(true);
    try {
      const r = await api.post("/public/match", { text });
      setResult(r.data);
    } catch (err) {
      setError(msg(err));
    } finally {
      setBusy(false);
    }
  }

  const bookLink = result?.category
    ? `/customer/new?category=${result.category._id}&description=${encodeURIComponent(text)}`
    : "/customer/new";

  return (
    <div className="bg-white text-slate-900 rounded-3xl p-5 sm:p-6 shadow-xl">
      <form onSubmit={check}>
        <label className="font-semibold">What is the problem?</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} required
          placeholder="Example: Kitchen tap is leaking, water everywhere"
          className="mt-2 w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button type="submit" disabled={busy || text.trim().length < 3} className={`${btn.primary} w-full py-3 mt-3`}>
          {busy ? "Checking..." : "Check my problem"}
        </button>
      </form>

      {error && <div className="mt-3"><Notice>{error}</Notice></div>}

      {result && (
        <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200 p-4">
          {result.category ? (
            <>
              <p className="text-sm text-slate-500">This looks like a</p>
              <p className="text-xl font-bold">{catIcon(result.category.name)} {result.category.name} job</p>
              <div className="flex items-center gap-2 mt-2">
                <UrgencyBadge urgency={result.urgency} />
                <span className="text-xs text-slate-500">{result.urgencyReason}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Link to={bookLink} className={btn.green}>Book a {result.category.name}</Link>
                <Link to={`/providers?category=${result.category._id}`} className={btn.ghost}>See technicians</Link>
              </div>
            </>
          ) : (
            <>
              <p className="font-semibold">We could not tell the service from this text.</p>
              <p className="text-sm text-slate-500 mt-1">Please pick a service from the list below, or describe the problem in more detail.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const STEPS = [
  ["1", "Describe", "Write the problem in your own words, in English or Roman Urdu."],
  ["2", "We match", "We find the right service, check urgency and show free technicians."],
  ["3", "Get it fixed", "Book a time slot. Urgent jobs are handled first."],
];

export default function Home() {
  const [stats, setStats] = useState(null);
  const [cats, setCats] = useState([]);
  const [top, setTop] = useState([]);

  useEffect(() => {
    api.get("/public/stats").then((r) => setStats(r.data)).catch(() => {});
    api.get("/categories").then((r) => setCats(pick(r))).catch(() => {});
    api.get("/public/providers", { params: { sort: "rating" } }).then((r) => setTop(pick(r).slice(0, 4))).catch(() => {});
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="bg-blue-800 text-white relative overflow-hidden">
        <div className="absolute -left-20 -bottom-24 w-72 h-72 rounded-full bg-blue-700/60" />
        <div className="absolute right-10 -top-16 w-56 h-56 rounded-full bg-orange-400/20" />
        <div className="relative max-w-6xl mx-auto px-4 py-14 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="inline-block bg-white/10 rounded-full px-4 py-1 text-sm mb-4">Plumbers, electricians, AC and more</p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">Tell us what is broken. We send the right technician.</h1>
            <p className="mt-4 text-blue-100 text-lg max-w-lg">
              Urgent problems come first, time slots never double-book, and every technician is rated by real customers.
            </p>
            {stats && (
              <div className="flex gap-8 mt-8">
                <div><p className="text-3xl font-bold">{stats.providers}</p><p className="text-sm text-blue-200">Technicians</p></div>
                <div><p className="text-3xl font-bold">{stats.completedJobs}</p><p className="text-sm text-blue-200">Jobs completed</p></div>
                <div><p className="text-3xl font-bold">{stats.avgRating || "-"}</p><p className="text-sm text-blue-200">Average rating</p></div>
              </div>
            )}
          </div>
          <ProblemBox />
        </div>
      </section>

      {/* Services */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold">Our services</h2>
            <p className="text-slate-500 text-sm">Pick a service to see the technicians who offer it.</p>
          </div>
          <Link to="/services" className="text-sm text-blue-700 font-medium">View all</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cats.map((c) => (
            <Link key={c._id} to={`/providers?category=${c._id}`}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition p-5 text-center">
              <div className="text-4xl">{catIcon(c.name)}</div>
              <p className="font-semibold mt-3 text-sm">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-bold mb-8 text-center">How FixIt Dispatch works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map(([n, title, text]) => (
              <div key={n} className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 text-orange-600 font-bold text-xl flex items-center justify-center">{n}</div>
                <h3 className="font-semibold mt-4">{title}</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top technicians */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold">Top rated technicians</h2>
            <p className="text-slate-500 text-sm">Chosen by customer ratings.</p>
          </div>
          <Link to="/providers" className="text-sm text-blue-700 font-medium">See all technicians</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {top.map((p) => <ProviderCard key={p._id} p={p} />)}
        </div>
      </section>

      {/* Call to action */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-orange-500 text-white rounded-3xl p-8 sm:p-10 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Something needs fixing today?</h2>
            <p className="text-orange-50">Create a free account and book in a minute.</p>
          </div>
          <Link to="/register" className="bg-white text-orange-600 font-semibold rounded-xl px-6 py-3">Get started</Link>
        </div>
      </section>
    </>
  );
}
