import { http } from "../api/http";
import { LOGIN_PATH, ME_PATH } from "../config/env";

export async function loginRequest(credentials) {
  const { data } = await http.post(LOGIN_PATH, credentials);
  return data;
}

export async function meRequest() {
  const { data } = await http.get(ME_PATH);
  return data;
}