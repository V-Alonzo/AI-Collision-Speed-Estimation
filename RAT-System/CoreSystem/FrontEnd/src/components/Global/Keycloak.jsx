import Keycloak from "keycloak-js";
import { env } from "../../config/runtimeEnv";

const keycloak = new Keycloak({
  url: env("clientuRL", ""),
  realm: env("realm", ""),
  clientId: env("clientId", ""),
});

export default keycloak;
