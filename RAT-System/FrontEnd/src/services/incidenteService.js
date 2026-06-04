import { http } from "../api/http";
import { API_PREFIX } from "../config/env";

const W = `${API_PREFIX}/wizard`;   // /v1/rat/wizard
const I = `${API_PREFIX}/incidentes`; // /v1/rat/incidentes

// ── Lista y detalle ───────────────────────────────────────────────────────────

export async function getIncidentes(params = {}) {
  const { data } = await http.get(I, { params });
  return data;
}

export async function getIncidenteById(uuid) {
  const { data } = await http.get(`${I}/${uuid}`);
  return data;
}

export async function deleteIncidente(uuid) {
  const { data } = await http.delete(`${I}/${uuid}`);
  return data;
}

export async function cambiarEstado(uuid, estado) {
  const { data } = await http.patch(`${I}/${uuid}/estado`, { estado });
  return data;
}

// ── Wizard — Paso 1: Incidente ────────────────────────────────────────────────

export async function createIncidentePaso1(payload) {
  const { data } = await http.post(`${W}/paso1-incidente`, payload);
  return data;
}

export async function updateIncidentePaso1(uuid, payload) {
  const { data } = await http.put(`${W}/${uuid}/paso1-incidente`, payload);
  return data;
}

// ── Wizard — Paso 2: Vehículo ─────────────────────────────────────────────────

export async function updatePaso2Vehiculo(uuid, payload) {
  const { data } = await http.put(`${W}/${uuid}/paso2-vehiculo`, payload);
  return data;
}

// ── Wizard — Paso 3: Ocupantes ────────────────────────────────────────────────

export async function updatePaso3Ocupantes(uuid, payload) {
  const { data } = await http.put(`${W}/${uuid}/paso3-ocupantes`, payload);
  return data;
}

// ── Wizard — Paso 4: Vía ──────────────────────────────────────────────────────

export async function updatePaso4Via(uuid, payload) {
  const { data } = await http.put(`${W}/${uuid}/paso4-via`, payload);
  return data;
}

// ── Wizard — Paso 5: Evidencia fotográfica ────────────────────────────────────

export async function storeFoto(uuid, formData) {
  const { data } = await http.post(`${W}/${uuid}/paso5-evidencia`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteFoto(uuid, fotoId) {
  const { data } = await http.delete(`${W}/${uuid}/paso5-evidencia/${fotoId}`);
  return data;
}

// ── Wizard — Paso 6: Deformación ──────────────────────────────────────────────

export async function updatePaso6Deformacion(uuid, payload) {
  const { data } = await http.put(`${W}/${uuid}/paso6-deformacion`, payload);
  return data;
}

// ── Wizard — Paso 7: Cálculo de velocidad ────────────────────────────────────

export async function storePaso7Calculo(uuid, payload) {
  const { data } = await http.post(`${W}/${uuid}/paso7-calculo`, payload);
  return data;
}

// ── Wizard — Paso 8: Narrativa ────────────────────────────────────────────────

export async function updatePaso8Narrativa(uuid, payload) {
  const { data } = await http.put(`${W}/${uuid}/paso8-narrativa`, payload);
  return data;
}

// ── Wizard — Paso 9: Reporte ──────────────────────────────────────────────────

export async function updatePaso9Reporte(uuid, payload) {
  const { data } = await http.put(`${W}/${uuid}/paso9-reporte`, payload);
  return data;
}