import axios from "axios";

// Local development leaves VITE_API_URL unset and relies on the Vite proxy.
// Deployed builds set it to the hosted API, e.g. https://campusconnect-api.onrender.com/api
const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "/api";

export const api = axios.create({ baseURL: API_BASE });

/* The session token lives in localStorage so it survives a refresh, a browser
   restart and reopening the site later on the same device. */
const TOKEN_KEY = "cc_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function errorMessage(err, fallback = "Something went wrong") {
  const message = err?.response?.data?.message;
  if (Array.isArray(message)) return message.join(". ");
  return message || err?.message || fallback;
}
