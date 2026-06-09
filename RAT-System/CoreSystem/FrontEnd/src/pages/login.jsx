import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import { env, envBool } from "../config/runtimeEnv";

const Login = () => {
  const navigate = useNavigate();
  const { keycloak, initialized } = useKeycloak();

  useEffect(() => {
    const disableKeycloak = envBool("DISABLE_KEYCLOAK", true);

    // Modo prueba: NO activar keycloak, entrar al dashboard como antes
    if (disableKeycloak) {
      navigate("/Dashboard", { replace: true });
      return;
    }

    // Keycloak habilitado (producción / flujo real)
    if (!initialized) return;

    if (!keycloak?.authenticated) {
      const option = env("logoutOption", env("logoutOptions", ""));
      keycloak?.login(option ? { redirectUri: option } : undefined);
      return;
    }

    navigate("/Dashboard", { replace: true });
  }, [initialized, keycloak, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white border border-gray-200 rounded shadow-sm p-6 text-sm text-gray-700">
        Cargando sesión...
      </div>
    </div>
  );
};

export default Login;
