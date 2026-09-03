import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeManifestIcons: false,
      manifest: {
        name: "Stockholm Trip",
        short_name: "Stockholm",
        description:
          "11–15 Sep 2026 itinerary, attractions and events, usable offline after the first visit.",
        theme_color: "#f4f1ea",
        background_color: "#f4f1ea",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        lang: "en",
        categories: ["travel", "navigation"],
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest,json}"],
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@navigation-data": fileURLToPath(
        new URL("./data/stockholm_navigation_data.json", import.meta.url),
      ),
      "@attractions-data": fileURLToPath(
        new URL("./data/stockholm_attractions.json", import.meta.url),
      ),
      "@events-data": fileURLToPath(
        new URL("./data/stockholm_events.json", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
  },
});
