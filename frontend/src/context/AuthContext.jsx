import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("cc_token"));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return;
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("cc_token");
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  function saveSession(data) {
    localStorage.setItem("cc_token", data.token);
    setToken(data.token);
    setUser(data.user);
    setLoading(false);
  }

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    saveSession(res.data);
  }

  async function register(name, email, password) {
    const res = await api.post("/auth/register", { name, email, password });
    saveSession(res.data);
  }

  function logout() {
    localStorage.removeItem("cc_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
