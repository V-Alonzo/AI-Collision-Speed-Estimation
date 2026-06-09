import React from "react";
import { createRoot } from "react-dom/client";
import "antd/dist/reset.css";
import { notification, ConfigProvider } from "antd";
import Router from "./Router.jsx";
import { ThemeProvider } from "./context/ThemContext.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import CrudAction from "./context/crud/crudAction.jsx";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import keycloak from "./components/Global/Keycloak";
import esES from "antd/locale/es_ES";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <ReactKeycloakProvider authClient={keycloak}>
    <ConfigProvider locale={esES}>
      <ThemeProvider>
        <CrudAction>
          <UserProvider>
            <Router />
          </UserProvider>
        </CrudAction>
      </ThemeProvider>
    </ConfigProvider>
  </ReactKeycloakProvider>
);

// Configuración global de notificaciones (ubicación por defecto)
notification.config({ placement: "topRight" });
