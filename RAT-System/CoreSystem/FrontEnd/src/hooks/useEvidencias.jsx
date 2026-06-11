import { useCallback, useEffect, useState } from "react";
import {
  getEvidenciasBySiniestro,
  createEvidencia,
  updateEvidencia,
  deleteEvidencia,
} from "../services/evidenciasService.js";

export function useEvidencias(siniestroId) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [evidencias, setEvidencias] = useState([]);

  const load = useCallback(async () => {
    if (!siniestroId) return;

    setLoading(true);
    setError("");

    try {
      const data = await getEvidenciasBySiniestro(siniestroId);
      const payload = data?.data || data;
      setEvidencias(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Error al cargar evidencias");
    } finally {
      setLoading(false);
    }
  }, [siniestroId]);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(
    async (payload) => {
      setError("");
      try {
        const res = await createEvidencia(payload);
        await load();
        return { ok: true, data: res };
      } catch (err) {
        const message = err?.response?.data?.message || err?.message || "Error al crear evidencia";
        setError(message);
        return { ok: false, error: message };
      }
    },
    [load]
  );

  const edit = useCallback(
    async (id, payload) => {
      setError("");
      try {
        const res = await updateEvidencia(id, payload);
        await load();
        return { ok: true, data: res };
      } catch (err) {
        const message = err?.response?.data?.message || err?.message || "Error al actualizar evidencia";
        setError(message);
        return { ok: false, error: message };
      }
    },
    [load]
  );

  const remove = useCallback(
    async (id) => {
      const confirmed = window.confirm("¿Eliminar evidencia?");
      if (!confirmed) return { ok: false };

      setError("");
      try {
        const res = await deleteEvidencia(id);
        await load();
        return { ok: true, data: res };
      } catch (err) {
        const message = err?.response?.data?.message || err?.message || "Error al eliminar evidencia";
        setError(message);
        return { ok: false, error: message };
      }
    },
    [load]
  );

  return {
    evidencias,
    loading,
    error,
    load,
    add,
    edit,
    remove,
    setEvidencias,
  };
}