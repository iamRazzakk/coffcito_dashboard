import { fileURLToPath, URL } from "node:url";
import { defineConfig, type ProxyOptions } from "vite";
import react from "@vitejs/plugin-react";

const imageProxy: Record<string, ProxyOptions> = {
  "/image": {
    target: "http://72.61.77.174:5010",
    changeOrigin: true,
    configure(proxy) {
      proxy.on("proxyRes", (proxyResponse) => {
        delete proxyResponse.headers["cross-origin-resource-policy"];
      });
    },
  },
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: imageProxy,
  },
  preview: {
    port: 5175,
    host: true,
    proxy: imageProxy,
  },
});
