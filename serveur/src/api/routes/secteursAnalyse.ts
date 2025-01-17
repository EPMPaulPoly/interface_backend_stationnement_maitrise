import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
import { DbQuartierAnalyse} from '../types/database';
// Types pour les requêtes


export const creationRouteurQuartiersAnalyse = (pool: Pool): Router => {
  const router = Router();
  // Get all lines
  // Get all lines
  const obtiensTousQuartiers: RequestHandler = async (_req, res): Promise<void> => {
    console.log('entering get all lines query')
    try {
      const client = await pool.connect();
      const query = `
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(
          json_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(geometry)::json,
            'properties', json_build_object(
              'ID', ID,
              'NOM', NOM,
              'SUPERFICIE', SUPERFICIE,
              'PERIMETRE', PERIMETRE
            )
          )
        )
      ) as geojson
      FROM public.sec_analyse
    `;

      const result = await client.query<DbQuartierAnalyse>('SELECT * FROM public.sec_analyse');
      res.json({ success: true, data: result.rows });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  };



  // Routes
  router.get('/', obtiensTousQuartiers);

  return router;
};