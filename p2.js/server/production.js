import express from 'express';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const app = express();
app.use(compression());

// Serve static assets with caching
app.use(express.static('dist/client', {
  maxAge: '1y',
  etag: false,
  lastModified: false
}));

app.use('*', async (req, res) => {
  try {
    const url = req.originalUrl;
    const queryClient = new QueryClient();
    
    // Stream the HTML response
    const { pipe } = renderToPipeableStream(
      <StaticRouter location={url}>
        <HelmetProvider>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </HelmetProvider>
      </StaticRouter>,
      {
        bootstrapScripts: ['/assets/client.js'],
        onShellReady() {
          res.setHeader('content-type', 'text/html');
          pipe(res);
        },
        onError(error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
        }
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).send('Internal Server Error');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
