import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
        base: '/',
        plugins: [react()],
        server: {
            hmr: false,
            watch: {
                usePolling: true
            },
            host: '0.0.0.0',
            strictPort: true,
            port: 4173,
            allowedHosts: true
        }
    };
});
