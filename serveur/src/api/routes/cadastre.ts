import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
import { DbTerritoire, ParamsCadastre, ParamsPeriode,DbRole,DbCadastre,ParamsQuartier,DbCadastreGeomIdOnly } from '../../types/database';
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

  const obtiensLotsParIdQuartier:RequestHandler<ParamsQuartier> = async(req,res):Promise<void>=>{
    let client;
    try {
      const { id } = req.params;
      console.log(`obtention lots pour quartier: ${id}`);
      client = await pool.connect();
      const query = `
        SELECT 
          cad.g_no_lot,
          cad.g_va_suprf,
          cad.g_nb_coo_1,
          cad.g_nb_coord,
          EXISTS (
                SELECT 1
                FROM inventaire_stationnement AS inv
                WHERE inv.g_no_lot = cad.g_no_lot
            ) AS bool_inv,
          ST_AsGeoJSON(cad.geometry) AS geojson_geometry
        FROM
          public.cadastre AS cad
        JOIN 
          public.sec_analyse AS polygons
          ON ST_Intersects(cad.geometry, polygons.geometry)
          AND polygons.id_quartier = $1
        `;

      const result = await client.query(query, [id]);
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
  router.get('/lot/quartier-ana/:id',obtiensLotsParIdQuartier)
  router.get('/lot/:id', obtiensLotParId)
  router.get('/role-associe/:id',obtiensRoleParIdLot)
  return router;
};