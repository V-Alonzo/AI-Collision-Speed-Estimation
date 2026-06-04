import React from "react";
import { Navigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import { env, envBool } from "../../../config/runtimeEnv";

/**
 * PrivateRoute:
 * - Si DISABLE_KEYCLOAK=true => deja pasar (modo prueba)
 * - Si Keycloak activo => requiere authenticated
 * - Opcionalmente valida roles
 */
export default function PrivateRoute({ children, roles = [] }) {
  const disableKeycloak = envBool("DISABLE_KEYCLOAK", true);
  const clientId = env("clientId", "");
  const { keycloak, initialized } = useKeycloak();

  // Modo prueba: NO bloquear
  if (disableKeycloak) return children;

  // Esperar Keycloak
  if (!initialized) return null;

  // Si no autenticado, ir a login
  if (!keycloak?.authenticated) {
    return <Navigate to="/login" replace />;
  }

  // Validación opcional de roles
  if (roles.length > 0 && clientId) {
    const userRoles = keycloak.resourceAccess?.[clientId]?.roles || [];
    const allowed = roles.some((r) => userRoles.includes(r));
    if (!allowed) return <Navigate to="/" replace />;
  }

  return children;
}
