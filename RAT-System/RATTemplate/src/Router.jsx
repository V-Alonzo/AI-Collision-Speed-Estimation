import React from "react";

import PrivateRoute from "./components/Global/helpers/PrivateRoute";

import { HashRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/login";

import Users from "./pages/Users/Home";

//configuracion
import Forms from "./pages/Configuracion/Forms/Home";
import Tables from "./pages/Configuracion/Tables/Home";

import Catalogos from "./components/Catalogos/Home";

import Page404 from "./pages/Page404";
import Page403 from "./pages/Page403";

import { Spin } from "antd";
import Layout from "./components/Layout/Layout";



import VerificacionUsuario from "./pages/VerificacionUsuario/VerificacionUsuario";


const loading = () => (
  <div className="animated fadeIn pt-1 text-center">
    {" "}
    <Spin /> Cargando...
  </div>
);

const Router = () => {
  return (
    // <ReactKeycloakProvider authClient={keycloak}>
    <HashRouter>
      <React.Suspense fallback={loading()}>
      <Routes>
          <Route path="/Dashboard" element={<PrivateRoute> <Layout> <Dashboard /> </Layout> </PrivateRoute>} />
          <Route path="/" element={<Layout><Login /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
        
          <Route path="Configuracion/Forms" element={<PrivateRoute><Layout><Forms /></Layout></PrivateRoute>} />
          <Route path="Configuracion/Tables" element={<PrivateRoute><Layout><Tables /></Layout> </PrivateRoute>} />
          <Route path="Configuracion/Catalogos" element={<PrivateRoute><Layout><Catalogos /></Layout> </PrivateRoute>} />          
          <Route path="Configuracion/Users" element={<PrivateRoute><Layout><Users /></Layout></PrivateRoute>} />
          <Route path="VerificacionUsuario" element={<PrivateRoute><Layout><VerificacionUsuario /></Layout></PrivateRoute>} />

        
       

          <Route path="/Page403" element={<PrivateRoute><Page403 /> </PrivateRoute>} />
          <Route path="/Page404" element={<PrivateRoute><Layout><Page404 /></Layout> </PrivateRoute>} />
          <Route path="*" element={<PrivateRoute><Layout><Dashboard /></Layout> </PrivateRoute>} />
        </Routes>
      </React.Suspense>
    </HashRouter>
    // </ReactKeycloakProvider>
  );
};

export default Router;
