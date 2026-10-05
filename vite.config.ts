import { defineConfig } from "vite";
import { resolve } from "node:path";

const pages = ["index", "espace", "test", "rapport", "opportunite", "communaute", "academie", "business-plan", "recrutement-a-z", "rejoindre"];

export default defineConfig({
  build: {
    rollupOptions: { input: Object.fromEntries(pages.map((p) => [p, resolve(__dirname, `${p}.html`)])) },
  },
});
