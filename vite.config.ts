import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
/** CJS 入口：包内 .mjs 在 Vite 配置加载时会触发 `require is not defined` */
const vitePrerender = require('vite-plugin-prerender');

export default defineConfig({
  plugins: [
    react(),
    vitePrerender({
      staticDir: resolve(process.cwd(), 'dist'),
      routes: ['/'],
      renderer: new vitePrerender.PuppeteerRenderer({
        maxConcurrentRoutes: 1,
        renderAfterTime: 5000,
      }),
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
