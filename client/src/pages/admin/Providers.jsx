import { useEffect, useState } from "react";
import api, { pick, msg } from "../../api";
import PasswordInput from "../../components/PasswordInput";
import { Empty, Hero, Modal, Notice, Spinner, btn, catIcon, inputCls } from "../../components/ui";

const emptyForm = {
  name: "", email: "", phone: "", password: "", areas: "", skills: "", start: 9, end: 18, categories: [],
};

export default function Providers() {
  const [providers, setProviders] = useState(null);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    api.get("/providers").then((r) => setProviders(pick(r))).catch((e) => setError(msg(e)));
  useEffect(() => {
    load();
    api.get("/categories").then((r) => setCategories(pick(r))).catch(() => {});
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleCat = (id) =>
    setForm({
      ...form,
      categories: form.categories.includes(id) ? form.categories.filter((c) => c !== id) : [...form.categories, id],
    });

  async function save(e) {
    e.preventDefault();
    setFormError("");
    if (form.categories.length === 0) return setFormError("Choose at least one service");
    if (Number(form.end) <= Number(form.start)) return setFormError("End time must be after start time");
    setBusy(true);
    try {
      await api.post("/providers", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        categories: form.categories,
        // "DHA, Gulberg" becomes ["DHA", "Gulberg"]
        areas: form.areas.split(",").map((a) => a.trim()).filter(Boolean),
        skills: form.skills,
        workingHours: { start: Number(form.start), end: Number(form.end) },
      });
      setOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setFormError(msg(err)); // for example: "Duplicate value for: email"
    } finally {
      setBusy(false);
    }
  }

  if (!providers && !error) return <Spinner />;
  const list = providers || [];

  return (
    <>
      <Hero title="Providers" subtitle="Add and view your plumbers, electricians and technicians.">
        <button className="bg-white text-blue-700 hover:bg-blue-50 rounded-xl px-5 py-2.5 text-sm font-semibold"
          onClick={() => { setFormError(""); setOpen(true); }}>
          + Add provider
        </button>
      </Hero>

      {error && <div className="mb-4"><Notice>{error}</Notice></div>}
      {list.length === 0 && <Empty title="No providers yet" text="Add your first provider." />}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((p) => (
          <div key={p._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                  {p.user?.name?.[0]}
                </div>
                <div>
                  <p className="font-semibold leading-tight">{p.user?.name}</p>
                  <p className="text-xs text-slate-500">{p.user?.phone}</p>
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
            <p className="text-xs text-slate-500 mt-3">Areas: {p.areas?.join(", ")}</p>
            <p className="text-xs text-slate-500">Hours: {p.workingHours?.start}:00 to {p.workingHours?.end}:00</p>
            <p className="text-sm mt-3">
              <span className="text-amber-500">&#9733;</span> <b>{p.ratingAvg || "New"}</b>
              <span className="text-slate-400"> ({p.ratingCount} reviews)</span>
            </p>
          </div>
        ))}
      </div>

      {open && (
        <Modal title="Add a provider" onClose={() => setOpen(false)}>
          <form onSubmit={save} className="space-y-3">
            {formError && <Notice>{formError}</Notice>}
            <input name="name" placeholder="Full name" value={form.name} onChange={change} required className={inputCls} />
            <input name="email" type="email" placeholder="Email (used to log in)" value={form.email} onChange={change} required className={inputCls} />
            <input name="phone" placeholder="Phone (e.g. 923001234567)" value={form.phone} onChange={change} required className={inputCls} />
            <PasswordInput name="password" placeholder="Temporary password (min 6)" value={form.password}
              onChange={change} required minLength={6} />

            <div>
              <p className="text-sm font-medium mb-1">Services</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button type="button" key={c._id} onClick={() => toggleCat(c._id)}
                    className={`text-sm rounded-full px-3 py-1 border ${form.categories.includes(c._id) ? "bg-blue-700 text-white border-blue-700" : "bg-white border-slate-300 text-slate-600"}`}>
                    {catIcon(c.name)} {c.name}
                  </button>
                ))}
              </div>
            </div>

            <input name="areas" placeholder="Areas, separated by commas (e.g. DHA, Gulberg)" value={form.areas}
              onChange={change} required className={inputCls} />
            <input name="skills" placeholder="Short skills note (optional)" value={form.skills} onChange={change} className={inputCls} />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Starts at</label>
                <input name="start" type="number" min="0" max="23" value={form.start} onChange={change} className={inputCls} />
              </div>
              <div>
                <label className="text-sm font-medium">Ends at</label>
                <input name="end" type="number" min="1" max="24" value={form.end} onChange={change} className={inputCls} />
              </div>
            </div>

            <button type="submit" disabled={busy} className={`${btn.primary} w-full py-2.5`}>
              {busy ? "Saving..." : "Save provider"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
