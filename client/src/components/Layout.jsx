import { Link, NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";

// Returns the home page path for each role
export const home = (role) =>
  role === "admin" ? "/admin" : role === "provider" ? "/provider" : "/customer";

const LINKS = {
  customer: [["/customer", "My Jobs"], ["/customer/new", "Book a service"]],
  provider: [["/provider", "My Queue"]],
  admin: [["/admin", "Dashboard"], ["/admin/providers", "Providers"], ["/admin/categories", "Categories"]],
};

export function Logo() {
  return (
    <svg width="34" height="34" viewBox="0 0 100 100" aria-label="FixIt Dispatch logo">
      <rect width="100" height="100" rx="22" fill="#1d4ed8" />
      <g transform="rotate(45 50 55)">
        <rect x="43" y="45" width="14" height="45" rx="7" fill="#fff" />
        <circle cx="50" cy="32" r="18" fill="#fff" />
        <rect x="43" y="10" width="14" height="22" fill="#1d4ed8" />
      </g>
      <circle cx="78" cy="24" r="9" fill="#f97316" />
    </svg>
  );
}

export default function Layout({ role }) {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  if (loading) return <p className="p-6">Loading...</p>;
  // Not logged in: go to login page
  // Not logged in: go to login, and remember this page so we can come back after login
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  // Wrong role for this page: go to the user's own page
  if (role && user.role !== role) return <Navigate to={home(user.role)} replace />;

  const link = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium ${
      isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <Logo />
              <span className="font-bold text-lg">FixIt Dispatch</span>
            </Link>
            <nav className="flex gap-1">
              {(LINKS[user.role] || []).map(([to, label]) => (
                <NavLink key={to} to={to} end className={link}>{label}</NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight hidden sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
            <button onClick={logout}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm hover:bg-slate-50">
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
