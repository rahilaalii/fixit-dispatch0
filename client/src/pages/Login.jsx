import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { msg } from "../api";
import { home } from "../components/Layout";
import { Notice, btn, inputCls } from "../components/ui";
import PasswordInput from "../components/PasswordInput";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from; // page the visitor wanted before logging in

  // Form values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // When the user becomes available, send them to their own home page
  useEffect(() => {
    if (user) navigate(from && user.role === "customer" ? from : home(user.role), { replace: true });
  }, [user, navigate, from]);

  async function handleSubmit(e) {
    e.preventDefault(); // stop the page from reloading
    setError("");
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(msg(err)); // show the backend error message
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-center bg-blue-800 text-white p-12">
        <h1 className="text-4xl font-bold leading-tight">Fix problems faster.</h1>
        <p className="mt-4 text-blue-100 max-w-md">
          FixIt Dispatch matches your problem with the right plumber, electrician or technician, and puts urgent jobs first.
        </p>
        <ul className="mt-8 space-y-2 text-blue-100 text-sm">
          <li>&#10003; Automatic urgency detection</li>
          <li>&#10003; No double booking</li>
          <li>&#10003; Best rated providers first</li>
        </ul>
      </div>

      <div className="flex items-center justify-center bg-slate-50 p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-slate-500 text-sm">Log in to your account</p>
          </div>

          {error && <Notice>{error}</Notice>}

          <input type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
          <PasswordInput placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} required />

          <button type="submit" disabled={busy} className={`${btn.primary} w-full py-2.5`}>
            {busy ? "Logging in..." : "Log in"}
          </button>

          <p className="text-center text-sm text-slate-500">
            No account?{" "}
            <Link to="/register" state={{ from }} className="text-blue-700 font-medium">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
