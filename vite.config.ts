import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/hortus/" : "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Hortus",
        short_name: "Hortus",
        theme_color: "#0d6f74",
        background_color: "#f7f6f2",
        display: "standalone",
        orientation: "portrait",
      },
      workbox: {
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/~oauth/, /^\/api\//, /^\/rest\//, /^\/auth\//],
        runtimeCaching: [
          {
            urlPattern: /\/rest\/v1\/(lands|plots|observations)/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "garden-data",
              expiration: { maxEntries: 200, maxAgeSeconds: 86400 },
            },
          },
          {
            urlPattern: /api\.weather\.gov/,
            handler: "NetworkFirst",
            options: { cacheName: "weather", networkTimeoutSeconds: 5 },
          },
          {
            urlPattern: /fonts\.googleapis\.com/,
            handler: "CacheFirst",
            options: {
              cacheName: "fonts",
              expiration: { maxAgeSeconds: 31536000 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
