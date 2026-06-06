import axios from "axios";
import { API_URL } from "../config/env";

const STORAGE_KEY = "cesvi_auth";

export const http = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use(
  (config) => {
    try {
      const raw   = localStorage.getItem(STORAGE_KEY);
      const token = raw ? JSON.parse(raw)?.token : null;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // JSON corrupto — continúa sin token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginEndpoint = error.config?.url?.includes("/login") || error.config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLoginEndpoint) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export function setAuthToken(token) {
  if (token) http.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete http.defaults.headers.common.Authorization;
}
