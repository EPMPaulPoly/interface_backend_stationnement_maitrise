import { Router } from 'express';
import { Pool } from 'pg';
import { creationRouteurQuartiersAnalyse } from './secteursAnalyse';
import { creationRouteurHistorique } from './historique';
import { creationRouteurInventaire } from './inventaire';

export const createApiRouter = (pool: Pool) => {
    const router = Router();
    console.log('going through router')
    router.use('/quartiers-analyse', creationRouteurQuartiersAnalyse(pool));
    router.use('/historique', creationRouteurHistorique(pool));
    router.use('/inventaire',creationRouteurInventaire(pool));
    return router;
}