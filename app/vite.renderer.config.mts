import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  base: "./", // Important for Electron as it will be loading from the file system
  build: {
    outDir: ".vite/build/renderer", // Match the expected output directory
    emptyOutDir: true,
    target: "esnext",
    minify: process.env.NODE_ENV === "production",
  },
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@renderer": path.resolve(__dirname, "./src/renderer"),
    },
  },
  server: {
    port: 5173, // Match the port in the main/index.js file
  },
});
