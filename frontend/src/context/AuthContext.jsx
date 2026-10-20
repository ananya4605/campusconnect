import { createContext, useContext, useEffect, useRef, useState } from "react";
import { api, clearToken, getToken, setToken } from "../api/client";

const AuthContext = createContext(null);

/* The hosted API sleeps when it is idle, so the first call after the site is
   reopened can fail before the server answers at all. A missing response is not
   a bad session, so it is retried; only a 401 from the server ends it. */
const RETRY_MS = [1000, 3000, 8000];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getToken);
  const [loading, setLoading] = useState(Boolean(getToken()));
  const cancelled = useRef(false);
  const timer = useRef(null);

  useEffect(() => {
    cancelled.current = false;
    if (!getToken()) {
      setLoading(false);
      return;
    }

    (async () => {
      for (let attempt = 0; ; attempt++) {
        try {
          const res = await api.get("/auth/me");
          if (cancelled.current) return;
          if (res.data.token) {
            setToken(res.data.token);
            setTokenState(res.data.token);
          }
          setUser(res.data.user);
          setLoading(false);
          return;
        } catch (err) {
          if (cancelled.current) return;
          if (err?.response?.status === 401) {
            clearToken();
            setTokenState(null);
            setUser(null);
            setLoading(false);
            return;
          }
          if (attempt >= RETRY_MS.length || navigator.onLine === false) {
            setLoading(false);
            return;
          }
          await new Promise((r) => {
            timer.current = setTimeout(r, RETRY_MS[attempt]);
          });
          if (cancelled.current) return;
        }
      }
    })();

    return () => {
      cancelled.current = true;
      clearTimeout(timer.current);
    };
  }, []);

  function saveSession(data) {
    setToken(data.token);
    setTokenState(data.token);
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
    cancelled.current = true;
    clearTimeout(timer.current);
    clearToken();
    setTokenState(null);
    setUser(null);
    setLoading(false);
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
