import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icon-512.png"],
      manifest: {
        name: "Mosaico",
        short_name: "Mosaico",
        description: "Peças que ensinam respeito. Aprender mesmo sem internet.",
        lang: "pt-BR",
        theme_color: "#1B1815",
        background_color: "#FBF7EE",
        display: "standalone",
        start_url: "/",
        icons: [{ src: "icon-512.png", sizes: "512x512", type: "image/png" }],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,json,woff2}"],
        navigateFallback: "index.html",
        runtimeCaching: [{ urlPattern: /\/api\//, handler: "NetworkOnly" }],
      },
    }),
  ],
  server: { proxy: { "/api": "http://localhost:8787" } },
});