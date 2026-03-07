import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    tailwindcss(),
    metaImagesPlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, "client/index.html"),
        the_method_co: path.resolve(import.meta.dirname, "client/the_method_co.html"),
        insights_index: path.resolve(import.meta.dirname, "client/insights/index.html"),
        insights_sprint: path.resolve(import.meta.dirname, "client/insights/ai-digital-strategy-sprint.html"),
        insights_landing_pages: path.resolve(import.meta.dirname, "client/insights/why-landing-pages-fail.html"),
        insights_ai_marketing: path.resolve(import.meta.dirname, "client/insights/ai-marketing-small-business.html"),
        insights_high_converting: path.resolve(import.meta.dirname, "client/insights/high-converting-landing-page.html"),
        insights_future: path.resolve(import.meta.dirname, "client/insights/future-of-ai-marketing.html")
      }
    }
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
