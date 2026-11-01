import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {diagnosticarLocal} from './src/services/localInference';

function prologMockPlugin() {
  return {
    name: 'prolog-mock-api',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url && req.url.startsWith('/prolog-api')) {
          const subpath = req.url.replace(/^\/prolog-api/, '').split('?')[0];

          if (subpath === '/salud' || subpath === '/salud/') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                estado: 'ok',
                servicio: 'swi-prolog-local-emulation',
              })
            );
            return;
          }

          if (subpath === '/diagnosticar' || subpath === '/diagnosticar/') {
            let body = '';
            req.on('data', (chunk: any) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                const data = body
                  ? JSON.parse(body)
                  : { si: [], desconocidos: [], no_comprobados: [] };
                const result = diagnosticarLocal(data);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result));
              } catch {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Payload JSON inválido' }));
              }
            });
            return;
          }

          if (
            subpath === '/encadenamiento_atras' ||
            subpath === '/encadenamiento_atras/'
          ) {
            let body = '';
            req.on('data', (chunk: any) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                const data = body ? JSON.parse(body) : {};
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    exito: true,
                    causa: data.causa || 'alternariosis',
                    hechos: data.hechos || [],
                    explicacion:
                      'Evaluación lógica resuelta por motor fitopatológico',
                  })
                );
              } catch {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Payload JSON inválido' }));
              }
            });
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), prologMockPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
