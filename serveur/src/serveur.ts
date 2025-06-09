import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import { createApiRouter } from './api/routes';
import config from './config';

const app = express();
const port = config.server.port;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Database connection
const pool = new Pool(config.database);

//setInterval(() => {
//  console.log('Connection Pool Stats:');
//  console.log('Total connections in pool:', pool.totalCount); // Total connections
//  console.log('Idle connections:', pool.idleCount);          // Idle connections
//  console.log('Waiting connections:', pool.waitingCount);    // Waiting connections
//}, 5000);

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



// Graceful shutdown
process.on('SIGTERM', () => {
  pool.end();
  process.exit(0);
});