import { useState, useEffect, useCallback } from "react";
import { loginRequest, meRequest } from "../services/authService";

const STORAGE_KEY = "cesvi_auth";

export function useAuth() {
  const [user, setUser]       = useState(null);
  const [booting, setBooting] = useState(true);

  const isAuthenticated = !!user;

  const restoreSession = useCallback(async () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const { token } = JSON.parse(raw);
      if (!token) return;
      const data = await meRequest();
      setUser(data.user ?? data);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setBooting(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (email, password) => {
    const data = await loginRequest({ email, password });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: data.token }));
    setUser(data.user ?? data);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setBooting(false);
  }, []);

  return { user, isAuthenticated, booting, login, logout };
}
1