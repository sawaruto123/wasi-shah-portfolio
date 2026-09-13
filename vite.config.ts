import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';

/**
 * Dev-only stand-in for the /api/upload Vercel function.
 *
 * `vite dev` has no serverless runtime, so CMS uploads used to 404 locally.
 * This mounts the *real* handler from api/upload.js onto the dev server, so
 * local and deployed share one implementation and can't drift apart.
 *
 * Usage is transparent — the admin posts to /api/upload either way.
 */
function devUploadApi(mode: string): Plugin {
  return {
    name: 'dev-upload-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/upload', async (req, res) => {
        // Vite exposes env vars to the client, but the function reads
        // process.env — so mirror the .env files into it (VITE_ prefixed or not).
        // `process` is reached through globalThis so this file needs no @types/node.
        const node = (globalThis as {
          process?: { env: Record<string, string | undefined>; cwd(): string };
        }).process;
        const env = loadEnv(mode, node?.cwd() ?? '.', '');
        if (node) {
          for (const [key, value] of Object.entries(env)) {
            if (!node.env[key]) node.env[key] = value;
          }
        }

        let handler: ((req: unknown, res: unknown) => Promise<void>) | undefined;
        try {
          const mod = (await server.ssrLoadModule('/api/upload.js')) as {
            default?: (req: unknown, res: unknown) => Promise<void>;
          };
          handler = mod.default;
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: `Could not load api/upload.js: ${e}` }));
          return;
        }
        if (!handler) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'api/upload.js has no default export' }));
          return;
        }

        // Minimal shim for the Vercel (req, res) helpers the handler uses.
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
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), devUploadApi(mode)],
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
