const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost/CESVI-PROYECTO/BackEnd/web/api";

export async function health() {
  const res = await fetch(`${API_BASE}/health.php`);
  if (!res.ok) throw new Error("No se pudo conectar con el backend");
  return res.json();
}
