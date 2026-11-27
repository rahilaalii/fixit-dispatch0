import { createContext, useContext, useEffect, useState } from "react";
import api from "./api";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
const unwrap = (d) => d.user || d.data || d;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) { setLoading(false); return; }
    api.get("/auth/me")
      .then((r) => setUser(unwrap(r.data)))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  const finish = async (token) => {
    localStorage.setItem("token", token);
    const me = await api.get("/auth/me");
    const u = unwrap(me.data);
    setUser(u);
    return u;
  };
  const login = async (email, password) =>
    finish((await api.post("/auth/login", { email, password })).data.token);
  const register = async (form) =>
    finish((await api.post("/auth/register", form)).data.token);
  const logout = () => { localStorage.removeItem("token"); setUser(null); };

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}