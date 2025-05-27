import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/social-memory-turkey/", // Required for GitHub Pages deployment
  build: {
    outDir: "build"
  },server: {
    proxy: {
      "/api": {
        target: "https://stgsuhn5s3.blob.core.windows.net",
        changeOrigin: true,
      },
      "/timemap": {
        target: "https://stgsuhn5s3.blob.core.windows.net",
        changeOrigin: true,
      }
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./test/setup.js",
    passWithNoTests: true
  },
});
