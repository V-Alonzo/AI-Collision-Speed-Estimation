import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import { envBool } from "../../../config/runtimeEnv";
import { useAuth } from "../../../hooks/useAuth";

const NavbarLogout = () => {
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();
  const { logout } = useAuth();

  const disableKeycloak = envBool("DISABLE_KEYCLOAK", true);

  const handleLogout = async () => {
    if (disableKeycloak) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    // flujo keycloak
    await keycloak?.logout();
  };

  return (
    <Button danger onClick={handleLogout}>
      Cerrar sesión
    </Button>
  );
};

export default NavbarLogout;
