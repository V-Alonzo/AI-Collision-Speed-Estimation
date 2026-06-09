import axios from "axios";

const clienteAxios = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    // ❌ NO pongas Content-Type aquí
  },
});

// ✅ Si mandas FormData, deja que axios ponga el boundary
clienteAxios.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  }
  return config;
});

export default clienteAxios;