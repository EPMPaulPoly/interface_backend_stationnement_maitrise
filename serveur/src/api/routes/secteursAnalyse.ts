import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
import { DbQuartierAnalyse } from 'database';
// Types pour les requêtes
import { Polygon,MultiPolygon } from 'geojson';
interface GeometryBody {
  geometry: Polygon|MultiPolygon;  
}

export const creationRouteurQuartiersAnalyse = (pool: Pool): Router => {
  const router = Router();
  // Get all lines
  // Get all lines
  const obtiensTousQuartiers: RequestHandler = async (_req, res): Promise<void> => {
    console.log('Serveur - obtentions tous quartiers analyse')
    let client;
    try {
      const { geometry } = _req.body as GeometryBody;
      client = await pool.connect();
      const query = `
        SELECT 
          id_quartier,
          nom_quartier,
          superf_quartier,
          peri_quartier,
          ST_AsGeoJSON(geometry) AS geojson_geometry
        FROM public.sec_analyse
      `;

      const result = await client.query<DbQuartierAnalyse>(query, );
      res.json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    } finally{
      if (client){
        client.release()
      }
    }
  };



  // Routes
  router.get('/', obtiensTousQuartiers);

  return router;
};