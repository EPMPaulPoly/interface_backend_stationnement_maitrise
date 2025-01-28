import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
import { DbInventaire,ParamsQuartier } from 'database';
// Types pour les requêtes
import { Polygon,MultiPolygon } from 'geojson';
interface GeometryBody {
  geometry: Polygon|MultiPolygon;  
}

export const creationRouteurInventaire = (pool: Pool): Router => {
  const router = Router();
  // Get all lines
  // Get all lines
  const obtiensInventaireParQuartier: RequestHandler<ParamsQuartier> = async (req, res): Promise<void> => {
    console.log('entering get inventory by neighborhood')
    let client;
    try {
      const { id } = req.params;
      client = await pool.connect();
      const query =`SELECT
            c.g_no_lot,
            ST_AsGeoJSON(c.geometry) AS geojson_geometry,
            i.n_places_min,
            i.n_places_max,
            i.id_er,
            i.id_reg_stat,
            i.commentaire,
            i.methode_estime,
            i.cubf
        FROM 
            public.cadastre c
        RIGHT JOIN
            public.inventaire_stationnement i
            ON i.g_no_lot = c.g_no_lot
        WHERE 
            ST_Intersects(c.geometry, 
                (SELECT 
                    geometry
                FROM public.sec_analyse 
                WHERE id_quartier = $1
                LIMIT 1)  -- Limiting to one geometry result
        );`
    const result = await client.query<DbInventaire>(
        query,
        [id]
      );
      res.json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    } finally{
      if(client){
        client.release()
      }
    }
  };



  // Routes
  router.get('/quartier/:id', obtiensInventaireParQuartier);

  return router;
};