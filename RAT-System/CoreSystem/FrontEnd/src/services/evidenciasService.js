import { http } from "../api/http";
import { API_PREFIX } from "../config/env";

export async function getEvidenciasByIncidente(incidenteId) {
  const { data } = await http.get(`${API_PREFIX}/incidentes/${incidenteId}/evidencias`);
  return data;
}

export async function createEvidencia(payload) {
  const { data } = await http.post(`${API_PREFIX}/evidencias`, payload);
  return data;
}

export async function updateEvidencia(id, payload) {
  const { data } = await http.put(`${API_PREFIX}/evidencias/${id}`, payload);
  return data;
}

export async function deleteEvidencia(id) {
  const { data } = await http.delete(`${API_PREFIX}/evidencias/${id}`);
  return data;
}