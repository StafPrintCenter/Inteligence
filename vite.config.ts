import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiOrigin = env.VITE_API_ORIGIN;

  return {
    plugins: [
      tanstackStart({
        server: { entry: "server" },
      }),
      react(),
      tailwindcss(),
      nitro({
        preset: "netlify",
        devProxy: {
          "/api": {
            target: `${apiOrigin}/api`,
            changeOrigin: true,
          },
          "/storage": {
            target: `${apiOrigin}/storage`,
            changeOrigin: true,
          },
        },
        routeRules: {
          "/api/**": { proxy: `${apiOrigin}/api/**` },
          "/storage/**": { proxy: `${apiOrigin}/storage/**` },
        },
      }),
    ],
    resolve: {
      tsconfigPaths: true,
    },
  };
});
