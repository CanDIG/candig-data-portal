import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    // In local dev against the mock server (candig-mock-server) the portal makes a
    // few same-origin requests (e.g. the gene autocomplete at
    // /genomics/htsget/v1/genes and the profile /query/whoami) that are normally
    // routed by the API gateway. Proxy them to the mock so they don't fall through
    // to the SPA index.html and blow up JSON parsing.
    //
    // Only enable this when the federation target is a local mock — against a real
    // backend these paths are served by the gateway, not the federation host, so
    // proxying them there would misroute the requests.
    const mockTarget = env.VITE_FEDERATION_API_SERVER || 'http://localhost:4000';
    const useMockProxy = /localhost|127\.0\.0\.1/.test(mockTarget);

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
            proxy: useMockProxy
                ? {
                      '/genomics': { target: mockTarget, changeOrigin: true },
                      '/query/whoami': { target: mockTarget, changeOrigin: true }
                  }
                : undefined
        }
    };
});
