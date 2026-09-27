import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// In development the browser talks only to Vite (port 5173), and Vite forwards /api to the API.
// That keeps the browser on one origin, the same way nginx does it in Docker.
const apiTarget = process.env.API_PROXY_TARGET ?? 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.WEB_PORT ?? 5173),
    strictPort: true,
    proxy: {
      '/api': apiTarget,
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
