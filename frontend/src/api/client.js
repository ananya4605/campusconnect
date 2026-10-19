import axios from "axios";

// Local development leaves VITE_API_URL unset and relies on the Vite proxy.
// Deployed builds set it to the hosted API, e.g. https://campusconnect-api.onrender.com/api
const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "/api";

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cc_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function errorMessage(err, fallback = "Something went wrong") {
  const message = err?.response?.data?.message;
  if (Array.isArray(message)) return message.join(". ");
  return message || err?.message || fallback;
}
