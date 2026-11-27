import { Link, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext";

// Returns the home page path for each role
export const home = (role) =>
  role === "admin" ? "/admin" : role === "provider" ? "/provider" : "/customer";

export default function Layout({ role }) {
  const { user, loading, logout } = useAuth();
  if (loading) return <p className="p-6">Loading...</p>;
  // Not logged in: go to login page
  if (!user) return <Navigate to="/login" replace />;
  // Wrong role for this page: go to the user's own page
  if (role && user.role !== role) return <Navigate to={home(user.role)} replace />;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-indigo-600 text-white px-6 py-3 flex items-center justify-between">
        <span className="font-bold">FixIt Dispatch</span>
        <div className="flex gap-4 items-center text-sm">
          {user.role === "customer" && (
            <>
              <Link to="/customer">My Jobs</Link>
              <Link to="/customer/new">New Job</Link>
            </>
          )}
          <span>{user.name} ({user.role})</span>
          <button onClick={logout} className="bg-white text-indigo-600 px-3 py-1 rounded">
            Logout
          </button>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}