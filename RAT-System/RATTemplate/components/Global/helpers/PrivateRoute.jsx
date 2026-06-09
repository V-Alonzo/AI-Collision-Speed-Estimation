import React from "react";
import { useKeycloak } from "@react-keycloak/web";
import { useNavigate } from "react-router-dom";
import BackdropMUI from "../BackdropCompont";

const PrivateRoute = ({ children }) => {
  const navigate = useNavigate();
  const { keycloak, initialized } = useKeycloak();
  const isLoggedIn = keycloak.authenticated;
  // console.log("keycloak", keycloak)

  if (!initialized) {
    return <BackdropMUI open={true} />;
  }

  if (!!keycloak.authenticated) {
    let PerAplication = false;

    if (keycloak.tokenParsed.access_system) {
      keycloak.tokenParsed.access_system[0].map((access) => {
        if (access === process.env.REACT_APP_clientId) {
          PerAplication = true;
        }
      });
    } else {
      PerAplication = false;
    }

    if (!PerAplication) {
      keycloak.logout(process.env.REACT_APP_logoutOptions);
      return;
    }
  }

  return isLoggedIn ? children : navigate("/");
};

export default PrivateRoute;
