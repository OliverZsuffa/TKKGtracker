import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/TKKGtracker/",
  test: {
    environment: "jsdom",
    restoreMocks: true,
  },
});
