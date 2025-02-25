import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
        base: '/',
        plugins: [react()],
        server: {
            watch: {
                usePolling: true
            },
            proxy: {
                '/v1': process.env.VITE_FEDERATION_API_SERVER,
                '/ingest': process.env.VITE_INGEST_SERVER,
                '/htsget': process.env.VITE_HTSGET_SERVER
            },
            host: '0.0.0.0',
            strictPort: true,
            port: 5173,
            allowedHosts: true
        }
    };
});
