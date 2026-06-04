import { http } from "../api/http";
import { API_PREFIX } from "../config/env";

export const getExpediente = async (uuid) => {
  const { data } = await http.get(`${API_PREFIX}/incidentes/${uuid}`);
  return data;
};
