import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteIncidente, getIncidentes } from "../services/incidenteService";

export function useIncidentes() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getIncidentes({ per_page: 1000 });
      const payload = data?.data ?? data ?? [];
      setRows(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "No se pudieron cargar los expedientes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((item) => {
      const values = [
        item.numero_siniestro,
        item.tipo_accidente,
        item.perito_nombre,
        item.ubicacion_ciudad,
        item.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return values.includes(term);
    });
  }, [rows, search]);

  const remove = useCallback(async (id, numeroSiniestro) => {
    const label = numeroSiniestro ? `el expediente "${numeroSiniestro}"` : "este expediente";
    const confirmed = window.confirm(`¿Está seguro que desea eliminar ${label}? Esta acción no se puede deshacer.`);
    if (!confirmed) return { ok: false };
    try {
      await deleteIncidente(id);
      await load();
      return { ok: true };
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "No se pudo eliminar el expediente";
      return { ok: false, error: message };
    }
  }, [load]);

  return { loading, error, rows, search, setSearch, filteredRows, load, remove };
}
