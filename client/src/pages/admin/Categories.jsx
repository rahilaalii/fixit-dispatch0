import { useEffect, useState } from "react";
import api, { pick, msg } from "../../api";
import { Empty, Hero, Notice, Spinner, btn, catIcon, inputCls } from "../../components/ui";

export default function Categories() {
  const [list, setList] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    api.get("/categories").then((r) => setList(pick(r))).catch((e) => setError(msg(e)));
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post("/categories", { name, description });
      setName("");
      setDescription("");
      load();
    } catch (err) {
      setError(msg(err)); // for example: "Duplicate value for: name"
    } finally {
      setBusy(false);
    }
  }

  async function remove(c) {
    if (!confirm(`Delete "${c.name}"? Providers and jobs that use it will lose this service name.`)) return;
    try {
      await api.delete(`/categories/${c._id}`);
      load();
    } catch (err) {
      setError(msg(err));
    }
  }

  if (!list && !error) return <Spinner />;

  return (
    <>
      <Hero title="Service categories" subtitle="The services your customers can book." />

      {error && <div className="mb-4"><Notice>{error}</Notice></div>}

      <form onSubmit={add} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6 grid md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Mechanic" className={inputCls} />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this service cover?" className={inputCls} />
        </div>
        <button type="submit" disabled={busy} className={`${btn.primary} py-2.5`}>+ Add category</button>
      </form>

      {(list || []).length === 0 && <Empty title="No categories" text="Add your first service above." />}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(list || []).map((c) => (
          <div key={c._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex justify-between items-start gap-3">
            <div className="flex gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">{catIcon(c.name)}</div>
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-slate-500">{c.description}</p>
              </div>
            </div>
            <button onClick={() => remove(c)} className="text-xs text-red-600 hover:underline">Delete</button>
          </div>
        ))}
      </div>
    </>
  );
}
