import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Local dev port 26419 is recorded in PORTS.md (repo standards). Keep it unique across projects.
const DEV_PORT = 26419;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: DEV_PORT,
    strictPort: true,
  },
  preview: {
    port: DEV_PORT,
    strictPort: true,
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
