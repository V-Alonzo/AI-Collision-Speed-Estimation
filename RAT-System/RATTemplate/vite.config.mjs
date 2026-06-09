import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "REACT_APP_");

  return {
    plugins: [react()],
    define: {
      "process.env": env,
    },
    build: {
      sourcemap: false, // Equivalente a GENERATE_SOURCEMAP=false en CRA
    },
    server: {
      port: 3000,
    },
    preview: {
      port: 4173,
    },
    test: {
      environment: "jsdom",
      setupFiles: "./src/setupTests.js",
    },
  };
});
