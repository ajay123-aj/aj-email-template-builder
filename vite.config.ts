import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const parsed = Number.parseInt(env.DEV_SERVER_PORT ?? '4002', 10);
  const port = Number.isFinite(parsed) && parsed > 0 ? parsed : 4002;

  return {
    plugins: [react()],
    server: {
      port,
      strictPort: true,
      host: '0.0.0.0',
    },
  };
});
