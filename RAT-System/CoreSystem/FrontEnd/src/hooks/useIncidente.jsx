import { useCallback, useEffect, useState } from "react";
import { getIncidenteById } from "../services/incidenteService";

export function useIncidente(id) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [incidente, setIncidente] = useState(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const data = await getIncidenteById(id);
      const payload = data?.data || data;
      setIncidente(payload);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Error al cargar expediente");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { incidente, loading, error, load, setIncidente };
}
