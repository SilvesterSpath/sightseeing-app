import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@navigation-data": fileURLToPath(
        new URL("./stockholm_navigation_data.json", import.meta.url),
      ),
      "@attractions-data": fileURLToPath(
        new URL("./stockholm_attractions.json", import.meta.url),
      ),
    },
  },
});
