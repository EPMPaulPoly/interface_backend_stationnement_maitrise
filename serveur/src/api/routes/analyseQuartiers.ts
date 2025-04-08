import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
import { DbTerritoire, ParamsCadastre, ParamsPeriode,DbRole,DbCadastre,ParamsQuartier,DbCadastreGeomIdOnly } from '../../types/database';
// Types pour les requêtes
import { Polygon,MultiPolygon } from 'geojson';
import { ParamsTerritoire } from '../../types/database';
interface GeometryBody {
  geometry: Polygon|MultiPolygon;  
}

export const creationRouteurAnalyseParQuartiers = (pool: Pool): Router => {
  const router = Router();
  const obtiensStationnementTotalParQuartierCarto : RequestHandler<ParamsTerritoire> = async (req, res): Promise<void> => {
    let client;
    try {
      const { ordreEstime } = req.params;
      const numbers: number[] = ordreEstime.split(",").map(Number);
      const selectedIds = numbers.slice(0, 3);
      console.log('Obtention stationnement agrégé par quartier');
      client = await pool.connect();
      const query = `
        WITH LotNeighborhood AS (
            -- Assign lots to a neighborhood based on 90% overlap
            SELECT 
              c.g_no_lot, 
              s.id_quartier AS id_quartier,
              s.superf_quartier,
              s.geometry  -- Capture neighborhood geometry
            FROM public.cadastre c
            JOIN public.sec_analyse s 
            ON ST_Area(ST_Intersection(s.geometry, c.geometry)) / ST_Area(c.geometry) > 0.9
        ),
        RankedInventory AS (
            -- Rank parking estimates by priority per lot
            SELECT 
                i.g_no_lot,
                ln.id_quartier,
                ln.geometry,  -- Pass geometry forward
                ln.superf_quartier,
                -- Select the correct parking estimate column based on methode_estime
                COALESCE(
                    CASE 
                        WHEN i.methode_estime = 1 THEN i.n_places_mesure
                        ELSE i.n_places_min
                    END, 0  -- Default to 0 if no estimate is available
                ) AS parking_estimate,
                i.methode_estime,
                RANK() OVER (
                    PARTITION BY i.g_no_lot 
                    ORDER BY 
                        CASE i.methode_estime
                            WHEN $1 THEN 1  -- Manual Estimate (highest priority)
                            WHEN $2 THEN 2  -- Auto Inventory + Manual Tax Data
                            WHEN $3 THEN 3  -- Fully Automatic Inventory (lowest priority)
                            ELSE 4
                        END
                ) AS rank
            FROM inventaire_stationnement i
            RIGHT JOIN LotNeighborhood ln ON i.g_no_lot = ln.g_no_lot  -- Use RIGHT JOIN to include all lots
        ),
        AggregatedParking AS (
            SELECT 
                r.id_quartier,
                r.geometry,  -- Pass geometry forward
                r.superf_quartier,
                CEIL(SUM(r.parking_estimate)) AS total_parking
            FROM RankedInventory r
            WHERE r.rank = 1  -- Pick the best estimate per lot
            GROUP BY r.id_quartier, r.geometry,r.superf_quartier
        )
        SELECT 
            ap.id_quartier,
            'Stationnement Total du Quartier' AS description,
            ap.total_parking AS valeur,
            ap.superf_quartier,
            ST_AsGeoJSON(ap.geometry) AS geojson_geometry
        FROM AggregatedParking ap
        ORDER BY ap.id_quartier;
      `;

      const result = await client.query(query, selectedIds);
      res.json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
      console.log('fourré dans la fonction obtention')
    } finally{
      if (client){
        client.release()
      }
    }
  };
  const obtiensStationnementParSuperfParQuartierCarto : RequestHandler<ParamsTerritoire> = async (req, res): Promise<void> => {
    let client;
    try {
      const { ordreEstime } = req.params;
      const numbers: number[] = ordreEstime.split(",").map(Number);
      const selectedIds = numbers.slice(0, 3);
      console.log('Obtention stationnement agrégé par quartier divisé par superficie');
      client = await pool.connect();
      const query = `
        WITH LotNeighborhood AS (
            -- Assign lots to a neighborhood based on 90% overlap
            SELECT 
              c.g_no_lot, 
              s.id_quartier AS id_quartier,
              s.superf_quartier,
              s.geometry  -- Capture neighborhood geometry
            FROM public.cadastre c
            JOIN public.sec_analyse s 
            ON ST_Area(ST_Intersection(s.geometry, c.geometry)) / ST_Area(c.geometry) > 0.9
        ),
        RankedInventory AS (
            -- Rank parking estimates by priority per lot
            SELECT 
                i.g_no_lot,
                ln.id_quartier,
                ln.geometry,  -- Pass geometry forward
                ln.superf_quartier,
                -- Select the correct parking estimate column based on methode_estime
                COALESCE(
                    CASE 
                        WHEN i.methode_estime = 1 THEN i.n_places_mesure
                        ELSE i.n_places_min
                    END, 0  -- Default to 0 if no estimate is available
                ) AS parking_estimate,
                i.methode_estime,
                RANK() OVER (
                    PARTITION BY i.g_no_lot 
                    ORDER BY 
                        CASE i.methode_estime
                            WHEN $1 THEN 1  -- Manual Estimate (highest priority)
                            WHEN $2 THEN 2  -- Auto Inventory + Manual Tax Data
                            WHEN $3 THEN 3  -- Fully Automatic Inventory (lowest priority)
                            ELSE 4
                        END
                ) AS rank
            FROM inventaire_stationnement i
            RIGHT JOIN LotNeighborhood ln ON i.g_no_lot = ln.g_no_lot  -- Use RIGHT JOIN to include all lots
        ),
        AggregatedParking AS (
            SELECT 
                r.id_quartier,
                r.geometry,  -- Pass geometry forward
                r.superf_quartier,
                CEIL(SUM(r.parking_estimate)) AS total_parking
            FROM RankedInventory r
            WHERE r.rank = 1  -- Pick the best estimate per lot
            GROUP BY r.id_quartier, r.geometry,r.superf_quartier
        )
        SELECT 
            ap.id_quartier,
            'Places par Mètre Carré' as description,
            ap.total_parking  / ap.superf_quartier AS valeur,
            ap.superf_quartier,
            ST_AsGeoJSON(ap.geometry) AS geojson_geometry
        FROM AggregatedParking ap
        ORDER BY ap.id_quartier;
      `;

      const result = await client.query(query, selectedIds);
      res.json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
      console.log('fourré dans la fonction obtention')
    } finally{
      if (client){
        client.release()
      }
    }
  };

  const obtiensStationnementPourcentParQuartierCarto : RequestHandler<ParamsTerritoire> = async (req, res): Promise<void> => {
    let client;
    try {
      const { ordreEstime } = req.params;
      const numbers: number[] = ordreEstime.split(",").map(Number);
      const selectedIds = numbers.slice(0, 3);
      console.log('Obtention stationnement agrégé par quartier divisé par superficie');
      client = await pool.connect();
      const query = `
        WITH LotNeighborhood AS (
            -- Assign lots to a neighborhood based on 90% overlap
            SELECT 
              c.g_no_lot, 
              s.id_quartier AS id_quartier,
              s.superf_quartier,
              s.geometry  -- Capture neighborhood geometry
            FROM public.cadastre c
            JOIN public.sec_analyse s 
            ON ST_Area(ST_Intersection(s.geometry, c.geometry)) / ST_Area(c.geometry) > 0.9
        ),
        RankedInventory AS (
            -- Rank parking estimates by priority per lot
            SELECT 
                i.g_no_lot,
                ln.id_quartier,
                ln.geometry,  -- Pass geometry forward
                ln.superf_quartier,
                -- Select the correct parking estimate column based on methode_estime
                COALESCE(
                    CASE 
                        WHEN i.methode_estime = 1 THEN i.n_places_mesure
                        ELSE i.n_places_min
                    END, 0  -- Default to 0 if no estimate is available
                ) AS parking_estimate,
                i.methode_estime,
                RANK() OVER (
                    PARTITION BY i.g_no_lot 
                    ORDER BY 
                        CASE i.methode_estime
                            WHEN $1 THEN 1  -- Manual Estimate (highest priority)
                            WHEN $2 THEN 2  -- Auto Inventory + Manual Tax Data
                            WHEN $3 THEN 3  -- Fully Automatic Inventory (lowest priority)
                            ELSE 4
                        END
                ) AS rank
            FROM inventaire_stationnement i
            RIGHT JOIN LotNeighborhood ln ON i.g_no_lot = ln.g_no_lot  -- Use RIGHT JOIN to include all lots
        ),
        AggregatedParking AS (
            SELECT 
                r.id_quartier,
                r.geometry,  -- Pass geometry forward
                r.superf_quartier,
                CEIL(SUM(r.parking_estimate)) AS total_parking
            FROM RankedInventory r
            WHERE r.rank = 1  -- Pick the best estimate per lot
            GROUP BY r.id_quartier, r.geometry,r.superf_quartier
        )
        SELECT 
            ap.id_quartier,
            'Pourcentage Territoire Stationnement' as description,
            15 * 100 * ap.total_parking  / ap.superf_quartier AS valeur,
            ap.superf_quartier,
            ST_AsGeoJSON(ap.geometry) AS geojson_geometry
        FROM AggregatedParking ap
        ORDER BY ap.id_quartier;
      `;

      const result = await client.query(query, selectedIds);
      res.json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
      console.log('fourré dans la fonction obtention pourcentage')
    } finally{
      if (client){
        client.release()
      }
    }
  };
  // Routes
  router.get('/carto/stat-tot/:ordreEstime',obtiensStationnementTotalParQuartierCarto)
  router.get('/carto/stat-sup/:ordreEstime',obtiensStationnementParSuperfParQuartierCarto)
  router.get('/carto/stat-perc/:ordreEstime',obtiensStationnementPourcentParQuartierCarto)
  return router;
};