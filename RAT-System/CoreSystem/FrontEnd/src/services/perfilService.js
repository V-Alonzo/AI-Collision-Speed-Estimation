import { http } from "../api/http";
import { API_PREFIX } from "../config/env";

export async function getPerfil() {
  const { data } = await http.get(`${API_PREFIX}/perfil`);
  return data;
}

export async function updatePerfil(payload) {
  const { data } = await http.put(`${API_PREFIX}/perfil`, payload);
  return data;
}

export async function getMisExpedientes() {
  const { data } = await http.get(`${API_PREFIX}/perfil/expedientes`);
  return data;
}

export async function cambiarPassword(payload) {
  const { data } = await http.put(`${API_PREFIX}/perfil/cambiar-password`, payload);
  return data;
}
