import { Router } from 'express';
import { Pool } from 'pg';
import { creationRouteurQuartiersAnalyse } from './secteursAnalyse';
import { creationRouteurHistorique } from './historique';
import { creationRouteurInventaire } from './inventaire';
import { creationRouteurTerritoires } from './territoire';
export const createApiRouter = (pool: Pool) => {
    const router = Router();
    console.log('going through router test')
    router.use('/quartiers-analyse', creationRouteurQuartiersAnalyse(pool));
    router.use('/historique', creationRouteurHistorique(pool));
    router.use('/inventaire',creationRouteurInventaire(pool));
    console.log('got to territoire')
    router.use('/territoire',creationRouteurTerritoires(pool));
    return router;
}