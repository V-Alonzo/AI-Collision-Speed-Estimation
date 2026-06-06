import { http } from "../api/http";
import { API_PREFIX } from "../config/env";

export async function getDashboard() {
  const { data } = await http.get(`${API_PREFIX}/dashboard`);
  return data;
}