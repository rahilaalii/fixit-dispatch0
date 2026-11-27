import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { msg } from "../api";
import { home } from "../components/Layout";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Redirect after successful registration
  useEffect(() => {
    if (user) navigate(home(user.role), { replace: true });
  }, [user, navigate]);

  // One handler for all inputs, based on the input's "name"
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(form);
    } catch (err) {
      setError(msg(err));
    } finally {
      setBusy(false);
    }
  }

  const input = "w-full border rounded p-2";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-xl shadow p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Create account</h1>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm rounded p-2">{error}</div>
        )}

        <input name="name" placeholder="Full name" value={form.name}
          onChange={handleChange} required className={input} />
        <input name="email" type="email" placeholder="Email" value={form.email}
          onChange={handleChange} required className={input} />
        <input name="phone" placeholder="Phone (e.g. 923001234567)" value={form.phone}
          onChange={handleChange} required className={input} />
        <input name="password" type="password" placeholder="Password" value={form.password}
          onChange={handleChange} required minLength={6} className={input} />

        <button type="submit" disabled={busy}
          className="w-full bg-blue-600 text-white rounded p-2 disabled:opacity-50">
          {busy ? "Creating..." : "Register"}
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 underline">Login</Link>
        </p>
      </form>
    </div>
  );
}