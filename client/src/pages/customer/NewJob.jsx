import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { pick, msg } from "../../api";
import { Notice, StatusPill, UrgencyBadge, btn, inputCls } from "../../components/ui";

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const hourLabel = (h) => `${String(h).padStart(2, "0")}:00`;
const today = () => new Date().toISOString().slice(0, 10);

export default function NewJob() {
  const [step, setStep] = useState(1); // 1 = details, 2 = choose provider, 3 = done
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);
  const [params] = useSearchParams(); // the homepage can send ?category=...&description=...
  const [form, setForm] = useState({
    category: params.get("category") || "", area: "", description: params.get("description") || "",
    address: "", date: "", hour: "",
  });
  const [options, setOptions] = useState([]); // matching providers
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Load categories, and build the area list from the providers' areas
  useEffect(() => {
    api.get("/categories").then((r) => setCategories(pick(r))).catch((e) => setError(msg(e)));
    api.get("/providers").then((r) => {
      const all = pick(r).flatMap((p) => p.areas || []);
      setAreas([...new Set(all)].sort());
    }).catch(() => {});
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Hours that are still in the future (when the date is today)
  const hoursNow = new Date().getHours();
  const hours = form.date === today() ? HOURS.filter((h) => h > hoursNow) : HOURS;

  // Step 1 -> 2: find providers for this category, area and time
  async function findProviders(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await api.get("/providers", { params: { category: form.category, area: form.area } });
      const hour = Number(form.hour);
      const list = pick(res).filter((p) => p.workingHours.start <= hour && hour < p.workingHours.end);
      // Ask the backend which hours are already booked for each provider that day
      const withSlots = await Promise.all(list.map(async (p) => {
        const s = await api.get(`/providers/${p._id}/slots`, { params: { date: form.date } });
        return { ...p, free: !s.data.bookedHours.includes(hour) };
      }));
      setOptions(withSlots);
      setStep(2);
    } catch (err) {
      setError(msg(err));
    } finally {
      setBusy(false);
    }
  }

  // Step 2 -> 3: create the job (providerId is optional: empty means "choose the best for me")
  async function book(providerId) {
    setError("");
    setBusy(true);
    try {
      const body = {
        category: form.category,
        description: form.description,
        area: form.area,
        address: form.address,
        scheduledAt: `${form.date}T${hourLabel(Number(form.hour))}:00`,
      };
      if (providerId) body.providerId = providerId;
      const res = await api.post("/jobs", body);
      setResult(res.data);
      setStep(3);
    } catch (err) {
      setError(msg(err)); // for example: "That time slot is already booked"
    } finally {
      setBusy(false);
    }
  }

  // ---------- Step 3: confirmation ----------
  if (step === 3 && result) {
    const j = result.job;
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mb-4">&#10003;</div>
        <h1 className="text-2xl font-bold">Request sent</h1>
        <p className="text-slate-600 mt-2">{result.message}</p>
        <div className="flex justify-center gap-2 mt-4">
          <UrgencyBadge urgency={j.urgency} />
          <StatusPill status={j.status} />
        </div>
        {j.provider && (
          <p className="mt-4 text-sm text-slate-600">
            Provider: <b>{j.provider.user?.name}</b> ({j.provider.user?.phone})
          </p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/customer" className={btn.primary}>View my jobs</Link>
          <button className={btn.ghost} onClick={() => { setStep(1); setResult(null); }}>Book another</button>
        </div>
      </div>
    );
  }

  // ---------- Step 2: choose a provider ----------
  if (step === 2) {
    const free = options.filter((p) => p.free);
    return (
      <div className="max-w-2xl mx-auto">
        <button className="text-sm text-slate-500 mb-3" onClick={() => setStep(1)}>&larr; Back</button>
        <h1 className="text-2xl font-bold">Choose a provider</h1>
        <p className="text-slate-500 text-sm mb-4">
          {form.area}, {form.date} at {hourLabel(Number(form.hour))}
        </p>
        {error && <div className="mb-4"><Notice>{error}</Notice></div>}

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4 flex flex-wrap justify-between items-center gap-3">
          <p className="text-sm text-blue-900">Not sure? Let the system pick the best rated provider who is free.</p>
          <button className={btn.primary} disabled={busy} onClick={() => book("")}>
            {busy ? "Booking..." : "Auto-assign best provider"}
          </button>
        </div>

        {options.length === 0 && (
          <Notice>No provider works in this area at this time. You can still send the request and the admin will assign someone.</Notice>
        )}
        {options.map((p) => (
          <div key={p._id} className="bg-white rounded-2xl border border-slate-200 p-5 mb-3 flex flex-wrap justify-between items-center gap-3">
            <div>
              <p className="font-semibold">{p.user?.name}</p>
              <p className="text-sm text-slate-500">
                <span className="text-amber-500">&#9733;</span> {p.ratingAvg || "New"} ({p.ratingCount} reviews) | works {p.workingHours.start}:00 to {p.workingHours.end}:00
              </p>
              <p className="text-xs text-slate-400 mt-1">Areas: {p.areas.join(", ")}</p>
            </div>
            {p.free ? (
              <button className={btn.green} disabled={busy} onClick={() => book(p._id)}>Book this provider</button>
            ) : (
              <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-3 py-1">Already booked at this time</span>
            )}
          </div>
        ))}
        {free.length === 0 && (
          <button className={`${btn.ghost} mt-2`} disabled={busy} onClick={() => book("")}>
            Send request without choosing (admin will assign)
          </button>
        )}
      </div>
    );
  }

  // ---------- Step 1: details ----------
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">Book a service</h1>
      <p className="text-slate-500 text-sm mb-4">Tell us what is wrong. You can write in English or Roman Urdu.</p>
      <form onSubmit={findProviders} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        {error && <Notice>{error}</Notice>}

        <div>
          <label className="text-sm font-medium">Service</label>
          <select name="category" value={form.category} onChange={change} required className={inputCls}>
            <option value="">Select a service</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">What is the problem?</label>
          <textarea name="description" value={form.description} onChange={change} required rows={3}
            placeholder="Example: Pipe burst in the kitchen, water everywhere" className={inputCls} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Area</label>
            <select name="area" value={form.area} onChange={change} required className={inputCls}>
              <option value="">Select your area</option>
              {areas.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Address</label>
            <input name="address" value={form.address} onChange={change} required
              placeholder="House, street" className={inputCls} />
          </div>
          <div>
            <label className="text-sm font-medium">Date</label>
            <input name="date" type="date" min={today()} value={form.date} onChange={change} required className={inputCls} />
          </div>
          <div>
            <label className="text-sm font-medium">Time</label>
            <select name="hour" value={form.hour} onChange={change} required className={inputCls}>
              <option value="">Select time</option>
              {hours.map((h) => <option key={h} value={h}>{hourLabel(h)}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" disabled={busy} className={`${btn.primary} w-full py-2.5`}>
          {busy ? "Searching..." : "Find providers"}
        </button>
      </form>
    </div>
  );
}
