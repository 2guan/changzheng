import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    proxy: { "/api": "http://127.0.0.1:4062" },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.endsWith("/content.json")) return "anthology";
          if (
            id.includes("/node_modules/react/") ||
            id.includes("/node_modules/react-dom/") ||
            id.includes("/node_modules/scheduler/")
          )
            return "react-vendor";
          if (
            id.includes("/node_modules/motion") ||
            id.includes("/node_modules/framer-motion/")
          )
            return "motion-vendor";
        },
      },
    },
  },
});
