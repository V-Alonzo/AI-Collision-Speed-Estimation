import Keycloak from "keycloak-js";
const keycloak = new Keycloak({
        url: process.env.REACT_APP_clientuRL,
    realm: "Cesvi",
    clientId: process.env.REACT_APP_clientId,    
});

export default keycloak;