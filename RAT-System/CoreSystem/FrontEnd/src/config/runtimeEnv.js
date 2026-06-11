export function env(name, fallback = "") {
  const keyVite = `VITE_${name}`;
  const val = import.meta.env[keyVite];
  if (val === undefined || val === null || val === "") return fallback;
  return val;
}

export function envBool(name, fallback = false) {
  const raw = env(name, fallback ? "true" : "false");
  return String(raw).toLowerCase() === "true";
}
