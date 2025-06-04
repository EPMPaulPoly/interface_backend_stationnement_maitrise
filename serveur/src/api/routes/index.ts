import { Router } from 'express';
import { Pool } from 'pg';
import { creationRouteurQuartiersAnalyse } from './secteursAnalyse';
import { creationRouteurHistorique } from './historique';
import { creationRouteurInventaire } from './inventaire';
import { creationRouteurTerritoires } from './territoire';
import { creationRouteurReglements } from './reglements';
import { creationRouteurEnsemblesReglements } from './ensemblesReglements';
import { creationRouteurCadastre } from './cadastre';
import { creationRouteurAnalyseParQuartiers } from './analyseQuartiers';
import { creationRouteurProfileAccumVehiculeQuartier } from './ProfileAccumulationVehicule';
import { creationRouteurEnsRegTerr } from './ensRegTerr';
import { creationRouteurUtilsationDuSol } from './utilisationDuSol';

export const createApiRouter = (pool: Pool) => {
    const router = Router();
    console.log('going through router test')
    router.use('/quartiers-analyse', creationRouteurQuartiersAnalyse(pool));
    router.use('/historique', creationRouteurHistorique(pool));
    router.use('/inventaire',creationRouteurInventaire(pool));
    router.use('/territoire',creationRouteurTerritoires(pool));
    router.use('/reglements',creationRouteurReglements(pool));
    router.use('/ens-reg',creationRouteurEnsemblesReglements(pool));
    router.use('/cadastre',creationRouteurCadastre(pool))
    router.use('/ana-par-quartier',creationRouteurAnalyseParQuartiers(pool))
    router.use('/PAV',creationRouteurProfileAccumVehiculeQuartier(pool))
    router.use('/ens-reg-terr',creationRouteurEnsRegTerr(pool))
    router.use('/cubf',creationRouteurUtilsationDuSol(pool))
    return router;
}