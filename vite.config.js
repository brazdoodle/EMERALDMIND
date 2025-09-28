import react from "@vitejs/plugin-react";
import path from "path";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    postcss({
      plugins: [tailwindcss("./tailwind.config.js")],
    }),
  ],
  css: {
    postcss: "./postcss.config.js",
  },
  server: {
    allowedHosts: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx", ".json"],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
    include: ["react", "react-dom", "lucide-react", "framer-motion", "ajv"],
  },
  build: {
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for stable dependencies
          vendor: ["react", "react-dom"],
          // UI components chunk
          ui: ["lucide-react", "framer-motion"],
          // Utilities chunk
          utils: ["ajv"],
        },
        // Optimize chunk file names for caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId
                .split("/")
                .pop()
                .replace(/\.\w+$/, "")
            : "chunk";
          return `assets/${facadeModuleId}-[hash].js`;
        },
      },
    },
    // Enable gzip-friendly builds
    minify: false, // Temporarily disabled terser
    // Increase chunk size warning limit for intentionally large chunks
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
});
