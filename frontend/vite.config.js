import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['grpc-web', 'google-protobuf'],
    force: true
  },
  build: {
    commonjsOptions: {
      include: [/grpc-web/, /google-protobuf/, /node_modules/]
    }
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
});