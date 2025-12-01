import axios from "axios";
import { parseApiErrorMessage } from "./utils/validation";

const baseURL =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_BASE ||
  "http://127.0.0.1:8000/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const redirectToErrorPage = (status, message) => {
  const code = status || 503;
  const encodedMessage = message ? `&message=${encodeURIComponent(message)}` : "";

  if (window.location.pathname.startsWith("/error")) return;

  window.location.assign(`/error?code=${code}${encodedMessage}`);
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = parseApiErrorMessage(error);

    const isNetworkError = !error.response;
    const isServerError = status >= 500;
    const isServiceUnavailable = status === 503;

    if (isNetworkError || isServiceUnavailable || isServerError) {
      redirectToErrorPage(status, message);
    }

    return Promise.reject(error);
  }
);
