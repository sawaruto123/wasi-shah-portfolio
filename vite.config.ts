import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';

/**
 * Dev-only stand-in for the /api/* Vercel functions.
 *
 * `vite dev` has no serverless runtime, so any fetch to /api/* used to 404 (and
 * Vite answered with HTML, which surfaced as a confusing "Upload failed").
 * This mounts the *real* handlers from api/ onto the dev server, so local and
 * deployed share one implementation and can't drift apart.
 */
function devApiRoutes(mode: string): Plugin {
  return {
    name: 'dev-api-routes',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        // (@types/node is intentionally absent, so narrow req.url by hand)
        const match = /^\/api\/([a-z0-9-]+)/i.exec((req as { url?: string }).url || '');
        if (!match) return next();
        const name = match[1];

        void (async () => {
          // Vite exposes env vars to the client, but the functions read
          // process.env — so mirror the .env files into it (VITE_ prefixed or not).
          // `process` is reached via globalThis so this file needs no @types/node.
          const node = (globalThis as {
            process?: { env: Record<string, string | undefined>; cwd(): string };
          }).process;
          if (node) {
            const env = loadEnv(mode, node.cwd(), '');
            for (const [key, value] of Object.entries(env)) {
              if (!node.env[key]) node.env[key] = value;
            }
          }

          let handler: ((req: unknown, res: unknown) => Promise<void>) | undefined;
          try {
            const mod = (await server.ssrLoadModule(`/api/${name}.js`)) as {
              default?: (req: unknown, res: unknown) => Promise<void>;
            };
            handler = mod.default;
          } catch {
            /* not an api route — fall through to Vite */
          }
          if (!handler) return next();

          // Minimal shim for the Vercel (req, res) helpers the handlers use.
          const shim = {
            statusCode: 200,
            status(code: number) {
              this.statusCode = code;
              return this;
            },
            json(payload: unknown) {
              res.statusCode = this.statusCode;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(payload));
              return this;
            },
          };

          try {
            await handler(req, shim);
          } catch (e) {
            if (!res.writableEnded) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: String(e) }));
            }
          }
        })();
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), devApiRoutes(mode)],
  build: {
    // three.js and the main app bundle are both large; raise the warning bar
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          three: ['three'],
        },
      },
    },
  },
}));
