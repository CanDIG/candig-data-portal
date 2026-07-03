import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    // In local dev the portal makes a few same-origin requests (e.g. the gene
    // autocomplete at /genomics/htsget/v1/genes and the profile /query/whoami)
    // that are normally routed by the API gateway. Point them at the mock server
    // (candig-mock-server) so they don't fall through to the SPA index.html and
    // blow up JSON parsing. Falls back to the documented mock port 4000.
    const mockTarget = env.VITE_FEDERATION_API_SERVER || 'http://localhost:4000';

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
            allowedHosts: true,
            proxy: {
                '/genomics': { target: mockTarget, changeOrigin: true },
                '/query/whoami': { target: mockTarget, changeOrigin: true }
            }
        }
    };
});
