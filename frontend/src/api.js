import axios from "axios";
import { parseApiErrorMessage } from "./utils/validation";


export const api = axios.create({
  baseURL: "http://localhost",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const shouldPrefixApi = (url) => {
  if (typeof url !== "string") return false;
  if (!url.startsWith("/")) return false;
  if (url.startsWith("/api")) return false;
  if (url.startsWith("/sanctum")) return false;
  return true;
};

api.interceptors.request.use((config) => {
  if (config?.url && shouldPrefixApi(config.url)) {
    config.url = `/api${config.url}`;
  }
  return config;
});

const MAX_RETRIES = 2;
const RETRY_STATUS = [429, 500, 502, 503, 504];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const isIdempotentMethod = (method) =>
  ["get", "head", "options"].includes((method || "").toLowerCase());

const shouldRetryRequest = (error) => {
  const config = error?.config;
  if (!config) return false;
  if (!isIdempotentMethod(config.method)) return false;

  const retryCount = config.__retryCount || 0;
  if (retryCount >= MAX_RETRIES) return false;

  const status = error?.response?.status;
  const isNetworkError = !error?.response;

  if (isNetworkError) return true;
  if (RETRY_STATUS.includes(status)) return true;

  return false;
};

const redirectToErrorPage = (status, message) => {
  const code = status || 503;
  const encodedMessage = message
    ? `&message=${encodeURIComponent(message)}`
    : "";

  if (window.location.pathname.startsWith("/error")) return;

  window.location.assign(`/error?code=${code}${encodedMessage}`);
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (shouldRetryRequest(error)) {
      const config = error.config;
      config.__retryCount = (config.__retryCount || 0) + 1;

      const delayMs = Math.min(500 * 2 ** (config.__retryCount - 1), 3000);
      await sleep(delayMs);
      return api(config);
    }

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
