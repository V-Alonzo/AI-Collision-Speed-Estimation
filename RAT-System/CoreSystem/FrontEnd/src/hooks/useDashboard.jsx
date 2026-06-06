import { useCallback, useEffect, useState } from "react";
import { getDashboard } from "../services/dashboardService";

export function useDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Error al cargar dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { dashboard, loading, error, load };
}