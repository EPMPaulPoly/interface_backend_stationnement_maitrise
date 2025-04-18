import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
import { DbHistoriqueGeopol } from '../../types/database';
// Types pour les requêtes
import { Polygon,MultiPolygon } from 'geojson';
interface GeometryBody {
  geometry: Polygon|MultiPolygon;  
}

export const creationRouteurHistorique = (pool: Pool): Router => {
  const router = Router();
  // Get all lines
  // Get all lines
  const obtiensTousPeriodes: RequestHandler = async (_req, res): Promise<void> => {
    console.log('Serveur - Obtention toutes periodes')
    let client;
    try {
      const { geometry } = _req.body as GeometryBody;
      client = await pool.connect();
      const query = `
        SELECT *
        FROM public.historique_geopol
        ORDER BY id_periode ASC
      `;

      const result = await client.query<DbHistoriqueGeopol>(query, );
      res.json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }finally{
      if (client){
        client.release()
      }
    }
  };



  // Routes
  router.get('/', obtiensTousPeriodes);

  return router;
};