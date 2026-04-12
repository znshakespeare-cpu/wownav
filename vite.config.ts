import type { IncomingMessage, ServerResponse } from 'http';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import handler from './api/bluepost-check';

type PatchedResponse = ServerResponse & {
  status: (code: number) => PatchedResponse;
  json: (body: unknown) => PatchedResponse;
};

function patchVercelLikeResponse(res: ServerResponse) {
  const r = res as PatchedResponse;
  if (typeof r.json === 'function') return;
  r.status = (code: number) => {
    res.statusCode = code;
    return r;
  };
  r.json = (body: unknown) => {
    if (!res.getHeader('content-type')) {
      res.setHeader('Content-Type', 'application/json');
    }
    res.end(JSON.stringify(body));
    return r;
  };
}

function devBluepostApiPlugin(): Plugin {
  return {
    name: 'dev-bluepost-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const im = req as IncomingMessage;
        const pathname = im.url?.split('?')[0];
        if (im.method === 'GET' && pathname === '/api/bluepost-check') {
          patchVercelLikeResponse(res);
          try {
            await handler(im as never, res as never);
          } catch (e) {
            if (!res.writableEnded) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: false,
                  error: e instanceof Error ? e.message : 'Unknown error',
                }),
              );
            }
          }
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), devBluepostApiPlugin()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
