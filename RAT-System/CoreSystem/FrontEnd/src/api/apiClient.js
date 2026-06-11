import axios from "axios";

const STORAGE_KEY = "cesvi_auth";
const BASE_URL    = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_PREFIX  = import.meta.env.VITE_API_PREFIX || "/api/v1/rat";

export const apiClient = axios.create({
  baseURL: `${BASE_URL}${API_PREFIX}`,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ── REQUEST: inyecta el Bearer token en cada llamada ─────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    try {
      const raw   = localStorage.getItem(STORAGE_KEY);
      const token = raw ? JSON.parse(raw)?.token : null;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // Si el JSON está corrupto simplemente no agrega el header
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE: maneja errores globales ─────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token inválido o expirado → limpia sesión y manda al login
      localStorage.removeItem(STORAGE_KEY);
      window.location.href = "/#/login?expired=1";
      return Promise.reject(new Error("Sesión expirada. Por favor inicia sesión nuevamente."));
    }

    if (status === 403) {
      return Promise.reject(new Error("No tienes permisos para realizar esta acción."));
    }

    if (status === 422) {
      // Errores de validación de Laravel
      const errors = error.response?.data?.errors;
      const msg = errors
        ? Object.values(errors).flat().join(" | ")
        : error.response?.data?.message || "Datos inválidos.";
      return Promise.reject(new Error(msg));
    }

    if (status === 500) {
      return Promise.reject(new Error("Error interno del servidor. Contacta al administrador."));
    }

    if (!error.response) {
      return Promise.reject(new Error("No se pudo conectar con el servidor. Verifica tu conexión."));
    }

    return Promise.reject(error);
  }
);
