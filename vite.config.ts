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
        blog_index: path.resolve(import.meta.dirname, "client/blog/index.html"),
        blog_sprint: path.resolve(import.meta.dirname, "client/blog/what-is-an-ai-digital-strategy-sprint.html"),
        blog_landing_pages: path.resolve(import.meta.dirname, "client/blog/why-most-landing-pages-fail.html"),
        blog_ai_marketing: path.resolve(import.meta.dirname, "client/blog/ai-marketing-for-small-businesses.html"),
        blog_high_converting: path.resolve(import.meta.dirname, "client/blog/how-to-build-a-high-converting-landing-page.html"),
        blog_future: path.resolve(import.meta.dirname, "client/blog/the-future-of-ai-driven-marketing.html")
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
