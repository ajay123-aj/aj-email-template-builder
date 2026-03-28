import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(function (_a) {
    var _b;
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), '');
    var parsed = Number.parseInt((_b = env.DEV_SERVER_PORT) !== null && _b !== void 0 ? _b : '4002', 10);
    var port = Number.isFinite(parsed) && parsed > 0 ? parsed : 4002;
    return {
        plugins: [react()],
        server: {
            port: port,
            strictPort: true,
            host: '0.0.0.0',
        },
    };
});
