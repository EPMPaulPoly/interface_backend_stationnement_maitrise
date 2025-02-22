import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
import { DbTerritoire, ParamsCadastre, ParamsPeriode,DbRole,DbCadastre } from '../../types/database';
// Types pour les requêtes
import { Polygon,MultiPolygon } from 'geojson';
interface GeometryBody {
  geometry: Polygon|MultiPolygon;  
}

export const creationRouteurCadastre = (pool: Pool): Router => {
  const router = Router();
  // Get all lines
  // Get all lines
  const obtiensLotParId: RequestHandler<ParamsCadastre> = async (req, res): Promise<void> => {
    
    let client;
    try {
      const { id } = req.params;
      const decodedId = id.replace(/_/g, " ");
      console.log('obtention lot cadastral');
      client = await pool.connect();
      const query = `
        SELECT 
          g_no_lot,
          g_nb_coord,
          g_nb_coo_1,
          g_va_suprf,
          ST_AsGeoJSON(geometry) AS geojson_geometry
        FROM public.cadastre
        WHERE g_no_lot = $1
      `;

      const result = await client.query<DbCadastre>(query, [decodedId]);
      res.json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    } finally{
      if (client){
        client.release()
      }
    }
  };

  const obtiensRoleParIdLot: RequestHandler<ParamsCadastre> = async (req,res):Promise<void>=>{
    let client;
    try {
      const { id } = req.params;
      const decodedId = id.replace(/_/g, " ");
      console.log('obtention lot cadastral');
      client = await pool.connect();
      const query = `
        WITH table_assoc AS (
            SELECT 
                id_provinc,
                g_no_lot
            FROM public.association_cadastre_role
            WHERE g_no_lot = $1
        )
        SELECT 
            rf.id_provinc,
            rf.rl0105a,
            rf.rl0306a,
            rf.rl0307a,
            rf.rl0307b,
            rf.rl0308a,
            rf.rl0311a,
            rf.rl0312a,
            rf.rl0404a,
            ST_AsGeoJSON(rf.geometry) AS geojson_geometry
        FROM public.role_foncier AS rf
        RIGHT JOIN table_assoc AS ta ON rf.id_provinc = ta.id_provinc;
      `;

      const result = await client.query<DbRole>(query, [decodedId]);
      res.json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    } finally{
      if (client){
        client.release()
      }
    }
  }

  // Routes
  router.get('/lot/:id', obtiensLotParId)
  router.get('/role-associe/:id',obtiensRoleParIdLot)

  return router;
};