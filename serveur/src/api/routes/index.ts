import { Router } from 'express';
import { Pool } from 'pg';
import { creationRouteurQuartiersAnalyse } from './secteursAnalyse';
import { creationRouteurHistorique } from './historique';
import { creationRouteurInventaire } from './inventaire';
import { creationRouteurTerritoires } from './territoire';
import { creationRouteurReglements } from './reglements';
export const createApiRouter = (pool: Pool) => {
    const router = Router();
    console.log('going through router test')
    router.use('/quartiers-analyse', creationRouteurQuartiersAnalyse(pool));
    router.use('/historique', creationRouteurHistorique(pool));
    router.use('/inventaire',creationRouteurInventaire(pool));
    router.use('/territoire',creationRouteurTerritoires(pool));
    router.use('/reglements',creationRouteurReglements(pool));
    return router;
}