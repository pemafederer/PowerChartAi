// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/opentopo': {
                target: 'https://api.opentopodata.org',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/opentopo/, ''),
            }
        }
    }
});
