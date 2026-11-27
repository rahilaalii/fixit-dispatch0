import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach the login token to every request automatically
api.interceptors.request.use((config) => {
  const t = localStorage.getItem("token");
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// Extract the list from a response, whatever key the backend used
export const pick = (res) => {
  const d = res.data;
  if (Array.isArray(d)) return d;
  for (const k of Object.keys(d || {})) if (Array.isArray(d[k])) return d[k];
  return [];
};

// Get a readable error message from a failed request
export const msg = (e) => e.response?.data?.message || e.message;

// NOTE: These 3 paths are guesses. If a button gives a 404 error,
// check the backend routes file and fix the path here only.
export const ENDPOINTS = {
  declineJob: (id) => ({ method: "post", url: `/jobs/${id}/decline` }),
  rateJob: (id) => ({ method: "post", url: `/jobs/${id}/rating` }),
  assignJob: (id) => ({ method: "patch", url: `/jobs/${id}/assign` }),
};

// Helper to call any of the endpoints above, with optional data
export const call = (cfg, data) => api.request({ ...cfg, data });

export default api;