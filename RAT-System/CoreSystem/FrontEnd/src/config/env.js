export const API_URL    = import.meta.env.VITE_API_URL    || "http://localhost:8000";
export const API_PREFIX = import.meta.env.VITE_API_PREFIX || "/v1/rat";
export const LOGIN_PATH = `${import.meta.env.VITE_API_PREFIX || "/v1/rat"}/auth/login`;
export const ME_PATH    = `${import.meta.env.VITE_API_PREFIX || "/v1/rat"}/auth/me`;
