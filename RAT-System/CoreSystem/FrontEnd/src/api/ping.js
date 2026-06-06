import axios from "axios";
import { env } from "../config/runtimeEnv";

const baseURL = env("BASE_URL", "http://127.0.0.1:8000");

export async function ping() {
  const res = await axios.get(`${baseURL}/web`);
  return res.data;
}
