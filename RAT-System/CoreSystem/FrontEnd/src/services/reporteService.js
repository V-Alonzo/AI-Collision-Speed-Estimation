import { http } from "../api/http";
import { API_PREFIX } from "../config/env";

const R = `${API_PREFIX}/reportes`;

export async function getReporte(uuid) {
  const { data } = await http.get(`${R}/${uuid}`);
  return data;
}

export async function generarReporte(uuid) {
  const { data } = await http.post(`${R}/${uuid}/generar`);
  return data;
}

export async function descargarReporte(uuid, nombreArchivo = "reporte.docx") {
  const response = await http.get(`${R}/${uuid}/descargar`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(response.data);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
