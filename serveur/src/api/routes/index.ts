import { Router } from 'express';
import { Pool } from 'pg';
import { creationRouteurQuartiersAnalyse } from './secteursAnalyse';
import { creationRouteurHistorique } from './historique';

export const createApiRouter = (pool: Pool) => {
    const router = Router();
    console.log('going through router')
    router.use('/quartiers-analyse', creationRouteurQuartiersAnalyse(pool));
    router.use('/historique', creationRouteurHistorique(pool));
    return router;
}