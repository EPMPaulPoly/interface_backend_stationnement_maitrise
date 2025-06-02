import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
import { DbHistoriqueGeopol,ParamsTerritoire } from '../../types/database';
// Types pour les requêtes
import { Polygon, MultiPolygon } from 'geojson';
interface GeometryBody {
    geometry: Polygon | MultiPolygon;
}


export const creationRouteurEnsRegTerr = (pool: Pool): Router => {
    const router = Router();

    const obtiensAssociations: RequestHandler<ParamsTerritoire> = async (req, res): Promise<void> => {
        console.log('Serveur - obtention ens-reg-terr par territoire')
        let client;
        try {
            client = await pool.connect();
            const { id } = req.params;
            const query = `
      WITH associations AS (
        SELECT 
          id_asso_er_ter,
          id_periode_geo,
          id_er
        FROM 
          public.association_er_territoire
        WHERE
          id_periode_geo = $1
      )
        SELECT
            associations.id_asso_er_ter,
            associations.id_periode_geo,
	          ers.id_er,
	          ers.description_er,
	          ers.date_debut_er,
	          ers.date_fin_er
        FROM public.ensembles_reglements_stat ers
        JOIN 
          associations ON associations.id_er = ers.id_er
        ORDER BY 
          date_debut_er ASC
      `;
            const result = await client.query(query, [id]);
            res.json({ success: true, data: result.rows });
        } catch (err) {
            res.status(500).json({ success: false, error: 'Database error test' });
        } finally {
            if (client) {
                client.release()
            }
        }
    };
    router.get('/par-territoire/:id', obtiensAssociations);
    return router;
}