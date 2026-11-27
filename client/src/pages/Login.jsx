import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { msg } from "../api";
import { home } from "../components/Layout";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Form values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // When the user becomes available, send them to their own home page
  useEffect(() => {
    if (user) navigate(home(user.role), { replace: true });
  }, [user, navigate]);

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-xl shadow p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">FixIt Dispatch</h1>
        <p className="text-center text-gray-500 text-sm">Login to your account</p>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm rounded p-2">{error}</div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border rounded p-2"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border rounded p-2"
        />

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-blue-600 text-white rounded p-2 disabled:opacity-50"
        >
          {busy ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm">
          No account?{" "}
          <Link to="/register" className="text-blue-600 underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}