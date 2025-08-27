import express ,{Application}from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import { createApiRouter } from './api/routes';
import config from './config';
import listEndpoints from 'express-list-endpoints';

const app = express();
const port = config.server.port;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Database connection
const pool = new Pool(config.database);


// Routes
app.use('/api', createApiRouter(pool));

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Server address info:${config.database.database}`)
  console.log(`Server running at ${new Date().toISOString()}`); 
});

type RouteInfo = {
  path: string;
  methods: string[];
  middlewares: string[];
};

export function extractRoutes(app: Application): RouteInfo[] {
  return extractRoutesFromStack((app._router?.stack ?? []), '');
}

function extractRoutesFromStack(stack: any[], prefix: string= ''): RouteInfo[] {
  const routes: RouteInfo[] = [];

  for (const layer of stack) {
    if (layer.route) {
      const path = prefix + layer.route.path;
      const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
      const middlewares = layer.route.stack
        .map((mw: any) => mw.name || '<anonymous>')
        .filter((name: string) => name !== '<anonymous>');

      routes.push({ path, methods, middlewares });
    } else if (layer.name === 'router' && layer.handle?.stack) {
      const mountPath = extractMountPath(layer);
      const newPrefix = prefix + mountPath;
      const childRoutes = extractRoutesFromStack(layer.handle.stack, newPrefix);
      routes.push(...childRoutes);
    }
  }

  return routes;
}

function extractMountPath(layer: any): string {
  if (layer.regexp && layer.regexp.source) {
    const match = layer.regexp.source.match(/\\\/([^\\]+)(?=\\\/\?\(\?=\\\/\|\$\))/);
    if (match) return '/' + match[1];
  }
  return '';
}


app.get('/api/routes', (req, res) => {
  const allRoutes = extractRoutes(app);
  res.json(allRoutes);
});


// Graceful shutdown
process.on('SIGTERM', () => {
  pool.end();
  process.exit(0);
});