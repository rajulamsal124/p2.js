import { createServer } from 'vite';
import express from 'express';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD;

async function createDevServer() {
  const app = express();
  app.use(compression());

  // Create Vite server in middleware mode
  const vite = await createServer({
    root: resolve(__dirname, '..'),
    logLevel: isTest ? 'error' : 'info',
    server: {
      middlewareMode: true,
      watch: {
        usePolling: true,
        interval: 100
      }
    },
    appType: 'custom'
  });

  // Use vite's connect instance as middleware
  app.use(vite.middlewares);

  app.use('*', async (req, res) => {
    const url = req.originalUrl;
    try {
      // Read index.html
      let template = fs.readFileSync(
        resolve(__dirname, '../index.html'),
        'utf-8'
      );

      // Apply Vite HTML transforms
      template = await vite.transformIndexHtml(url, template);

      // Send transformed HTML
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      console.error(e);
      res.status(500).end(e.message);
    }
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Development server running at http://localhost:${port}`);
  });
}

createDevServer();
