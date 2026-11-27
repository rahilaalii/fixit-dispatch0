import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { pick, msg } from "../../api";

export default function NewJob() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    category: "",
    description: "",
    area: "",
    address: "",
    scheduledAt: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Load categories once when the page opens
  useEffect(() => {
    api.get("/categories")
      .then((res) => setCategories(pick(res)))
      .catch((err) => setError(msg(err)));
  }, []);

  // One handler for all inputs, based on the input's "name"
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      // datetime-local gives "2026-12-10T10:00", so we add seconds
      await api.post("/jobs", { ...form, scheduledAt: form.scheduledAt + ":00" });
      navigate("/customer");
    } catch (err) {
      setError(msg(err)); // e.g. "That time slot is already booked"
    } finally {
      setBusy(false);
    }
  }

  const input = "w-full border rounded p-2";

  return (
    <div className="max-w-lg mx-auto p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        <h1 className="text-xl font-bold">Book a service</h1>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm rounded p-2">{error}</div>
        )}

        <select name="category" value={form.category} onChange={handleChange}
          required className={input}>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <textarea name="description" placeholder="Describe your problem"
          value={form.description} onChange={handleChange} required rows={3}
          className={input} />
        <input name="area" placeholder="Area (e.g. DHA)" value={form.area}
          onChange={handleChange} required className={input} />
        <input name="address" placeholder="Address" value={form.address}
          onChange={handleChange} required className={input} />
        <input name="scheduledAt" type="datetime-local" value={form.scheduledAt}
          onChange={handleChange} required className={input} />
        <p className="text-xs text-gray-500">For testing, choose a time like 10:00.</p>

        <button type="submit" disabled={busy}
          className="w-full bg-blue-600 text-white rounded p-2 disabled:opacity-50">
          {busy ? "Booking..." : "Book now"}
        </button>
      </form>
    </div>
  );
}