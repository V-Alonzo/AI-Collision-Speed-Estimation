import { http } from "../api/http";
import { API_PREFIX } from "../config/env";

const BASE = `${API_PREFIX}/admin`;

export const getUsuarios = () =>
  http.get(`${BASE}/usuarios`).then((r) => r.data);

export const updateUserPassword = (id, passwordNuevo) =>
  http.put(`${BASE}/usuarios/${id}/password`, { password_nuevo: passwordNuevo }).then((r) => r.data);
