import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
import { DbTerritoire, ParamsPeriode } from '../../types/database';
// Types pour les requêtes
import { Polygon,MultiPolygon } from 'geojson';
interface GeometryBody {
  geometry: Polygon|MultiPolygon;  
}

export const creationRouteurTerritoires = (pool: Pool): Router => {
  const router = Router();
  // Get all lines
  // Get all lines
  const obtiensTerritoiresParPeriode: RequestHandler<ParamsPeriode> = async (req, res): Promise<void> => {
    console.log('obtention territoire')
    let client;
    try {
      const { id } = req.params;
      client = await pool.connect();
      const query = `
        SELECT 
          id_periode_geo,
          ville,
          secteur,
          id_periode,
          ST_AsGeoJSON(geometry) AS geojson_geometry
        FROM public.cartographie_secteurs
        WHERE id_periode = $1
      `;

      const result = await client.query<DbTerritoire>(query, [id]);
      res.json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    } finally{
      if (client){
        client.release()
      }
    }
  };

  const obtiensTerritoiresParId: RequestHandler<ParamsPeriode> = async (req, res): Promise<void> => {
    console.log('obtention territoire')
    let client;
    try {
      const { id } = req.params;
      client = await pool.connect();
      const query = `
        SELECT 
          id_periode_geo,
          ville,
          secteur,
          id_periode,
          ST_AsGeoJSON(geometry) AS geojson_geometry
        FROM public.cartographie_secteurs
        WHERE id_periode_geo = $1
      `;

      const result = await client.query<DbTerritoire>(query, [id]);
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
  router.get('/periode/:id', obtiensTerritoiresParPeriode)
  router.get('/periode-geo/:id',obtiensTerritoiresParId)
  return router;
};