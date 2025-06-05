import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
import { DbHistoriqueGeopol,ParamsAssocEnsReg,ParamsAssocEnsRegTerr,ParamsTerritoire } from '../../types/database';
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
    const nouvelleAssociation:RequestHandler<void> = async(req,res):Promise<void>=>{
      console.log('Serveur - obtention ens-reg-terr par territoire')
        let client;
        try {
            client = await pool.connect();
            const { id_er,id_periode_geo } = req.body;
            const query = `
                INSERT INTO public.association_er_territoire(id_er,id_periode_geo)
                VALUES ($1,$2)
                RETURNING *;
              `;
            const result = await client.query(query, [id_er,id_periode_geo]);
            res.json({ success: true, data: result.rows[0] });
        } catch (err) {
            res.status(500).json({ success: false, error: 'Database error test' });
        } finally {
            if (client) {
                client.release()
            }
        }
    }
    const supprimeAssociation:RequestHandler<ParamsAssocEnsRegTerr>= async(req,res):Promise<void>=>{
      console.log('Serveur - suppression assoc ens-reg-terr')
        let client;
        try {
            client = await pool.connect();
            const { id } = req.params;
            const query = `
                DELETE FROM public.association_er_territoire
                WHERE id_asso_er_ter = $1
                RETURNING *;
              `;
            const result = await client.query(query, [id]);
            res.json({success:result.rowCount===1});
        } catch (err) {
            res.status(500).json({ success: false, error: 'Database error test' });
        } finally {
            if (client) {
                client.release()
            }
        }
    }
    const modifieAssociation:RequestHandler<ParamsAssocEnsRegTerr>=async(req,res):Promise<void>=>{
      console.log('Serveur - suppression assoc ens-reg-terr')
        let client;

        try {
            client = await pool.connect();
            const { id } = req.params;
            const { id_er,id_periode_geo } = req.body;
            const query = `
                UPDATE public.association_er_territoire
                SET
                  id_er = $1,
                  id_periode_geo = $2
                WHERE id_asso_er_ter = $3
                RETURNING *;
              `;
            const result = await client.query(query, [id_er,id_periode_geo,id]);
            res.json({success:result.rowCount===1,data:result.rows[0]});
        } catch (err) {
            res.status(500).json({ success: false, error: 'Database error test' });
        } finally {
            if (client) {
                client.release()
            }
        }
    }
    router.get('/par-territoire/:id', obtiensAssociations);
    router.post('/association',nouvelleAssociation)
    router.delete('/association/:id',supprimeAssociation)
    router.put('/association/:id',modifieAssociation)
    return router;
}