import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { msg } from "../api";
import { home } from "../components/Layout";
import { Notice, btn, inputCls } from "../components/ui";
import PasswordInput from "../components/PasswordInput";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from; // page the visitor wanted before logging in

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Redirect after successful registration
  useEffect(() => {
    if (user) navigate(from && user.role === "customer" ? from : home(user.role), { replace: true });
  }, [user, navigate, from]);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Create your account</h2>
          <p className="text-slate-500 text-sm">Book trusted service providers</p>
        </div>

        {error && <Notice>{error}</Notice>}

        <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required className={inputCls} />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className={inputCls} />
        <input name="phone" placeholder="Phone (e.g. 923001234567)" value={form.phone} onChange={handleChange} required className={inputCls} />
        <PasswordInput name="password" placeholder="Password (min 6 characters)" value={form.password}
          onChange={handleChange} required minLength={6} />

        <button type="submit" disabled={busy} className={`${btn.primary} w-full py-2.5`}>
          {busy ? "Creating..." : "Register"}
        </button>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" state={{ from }} className="text-blue-700 font-medium">Log in</Link>
        </p>
      </form>
    </div>
  );
}
