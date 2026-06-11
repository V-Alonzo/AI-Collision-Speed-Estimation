import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Login } from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Expedientes from "./pages/Expedientes";
import NuevoCaso from "./pages/NuevoCaso";
import DetalleExpediente from "./pages/DetalleExpediente";
import Catalogos from "./pages/Catalogos";
import Perfil from "./pages/Perfil";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminUsuarios from "./pages/AdminUsuarios";
import EstimacionVelocidad from "./pages/EstimacionVelocidad/EstimacionVelocidad";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: ProtectedRoute,
    children: [
      {
        Component: Layout,
        children: [
          { index: true, Component: Dashboard },
          { path: "expedientes", Component: Expedientes },
          { path: "expedientes/nuevo", Component: NuevoCaso },
          { path: "expedientes/:id", Component: DetalleExpediente },
          { path: "expedientes/:id/editar", Component: NuevoCaso },
          { path: "configuracion/catalogos", Component: Catalogos },
          { path: "perfil", Component: Perfil },
          { path: "admin/usuarios", Component: AdminUsuarios },
          { path: "estimacion-velocidad/*", Component: EstimacionVelocidad },
        ],
      },
    ],
  },
]);
