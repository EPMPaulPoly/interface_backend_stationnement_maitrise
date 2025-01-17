import { Router } from 'express';
import { Pool } from 'pg';
import { creationRouteurQuartiersAnalyse } from './secteursAnalyse';

export const createApiRouter = (pool: Pool) => {
  const router = Router();
  console.log('going through router')
  router.use('/quartiers-analyse', creationRouteurQuartiersAnalyse(pool));

  return router;}