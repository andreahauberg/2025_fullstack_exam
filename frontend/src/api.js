import axios from "axios";

const baseURL =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_BASE ||
  "http://localhost:8000/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // If we have a real bearer token, send it; otherwise rely on cookies
    const stored = localStorage.getItem("token");
    if (stored && stored !== "cookie-auth") {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${stored}`;
    } else if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
