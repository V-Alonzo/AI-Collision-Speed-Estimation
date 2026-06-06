import { useCallback, useEffect, useState } from "react";
import { getPerfil, updatePerfil, getMisExpedientes, cambiarPassword as apiCambiarPassword } from "../services/perfilService";

export function usePerfil() {
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [perfil, setPerfil]           = useState(null);
  const [stats, setStats]             = useState(null);
  const [expedientes, setExpedientes] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [perfilData, exps] = await Promise.all([getPerfil(), getMisExpedientes()]);
      setPerfil(perfilData.perfil);
      setStats(perfilData.stats);
      setExpedientes(exps);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Error al cargar perfil");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = useCallback(async (payload) => {
    try {
      await updatePerfil(payload);
      await load();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err?.response?.data?.message || err?.message || "Error al guardar" };
    }
  }, [load]);

  const cambiarPassword = useCallback(async (payload) => {
    try {
      await apiCambiarPassword(payload);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err?.response?.data?.message || err?.message || "Error al cambiar contraseña" };
    }
  }, []);

  return { perfil, stats, expedientes, loading, error, load, update, cambiarPassword };
}
