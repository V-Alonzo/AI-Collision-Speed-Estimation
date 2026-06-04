import { useCallback, useEffect, useState } from "react";
import {
  getCatalogoEntorno,
  createCatalogoEntorno,
  updateCatalogoEntorno,
  deleteCatalogoEntorno,
} from "../services/catalogosService";

export function useCatalogoEntorno() {
  const [entorno, setEntorno] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getCatalogoEntorno();
      const payload = data?.data || data;
      setEntorno(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Error al cargar catálogo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(async (payload) => {
    setError("");
    try {
      const res = await createCatalogoEntorno(payload);
      await load();
      return { ok: true, data: res };
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Error al agregar catálogo";
      setError(message);
      return { ok: false, error: message };
    }
  }, [load]);

  const edit = useCallback(async (id, payload) => {
    setError("");
    try {
      const res = await updateCatalogoEntorno(id, payload);
      await load();
      return { ok: true, data: res };
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Error al actualizar catálogo";
      setError(message);
      return { ok: false, error: message };
    }
  }, [load]);

  const remove = useCallback(async (id) => {
    const confirmed = window.confirm("¿Eliminar elemento del catálogo?");
    if (!confirmed) return { ok: false };

    setError("");
    try {
      const res = await deleteCatalogoEntorno(id);
      await load();
      return { ok: true, data: res };
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Error al eliminar catálogo";
      setError(message);
      return { ok: false, error: message };
    }
  }, [load]);

  return { entorno, loading, error, load, add, edit, remove };
}