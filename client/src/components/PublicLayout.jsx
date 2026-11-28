import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { Logo, home } from "./Layout";
import { btn } from "./ui";

// Top bar and footer for pages that anyone can open (no login needed)
export default function PublicLayout() {
  const { user } = useAuth();
  const link = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? "text-blue-700" : "text-slate-600 hover:text-slate-900"}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <Logo />
              <span className="font-bold text-lg">FixIt Dispatch</span>
            </Link>
            <nav className="hidden sm:flex">
              <NavLink to="/services" className={link}>Services</NavLink>
              <NavLink to="/providers" className={link}>Technicians</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to={home(user.role)} className={btn.primary}>My dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-700 px-3 py-2">Log in</Link>
                <Link to="/register" className={btn.primary}>Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-slate-900 text-slate-300 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-10 grid sm:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="font-bold text-white text-lg">FixIt Dispatch</p>
            <p className="mt-2 text-slate-400">Describe the problem. We send the right technician, urgent jobs first.</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-2">Explore</p>
            <p><Link to="/services" className="hover:text-white">Services</Link></p>
            <p><Link to="/providers" className="hover:text-white">Technicians</Link></p>
          </div>
          <div>
            <p className="font-semibold text-white mb-2">Account</p>
            <p><Link to="/login" className="hover:text-white">Log in</Link></p>
            <p><Link to="/register" className="hover:text-white">Create an account</Link></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
