import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
import { DbTerritoire, ParamsCadastre, ParamsPeriode, DbRole, DbCadastre, ParamsQuartier, DbCadastreGeomIdOnly } from '../../types/database';
// Types pour les requêtes
import { Polygon, MultiPolygon } from 'geojson';
import { validateBboxQuery } from '../validators/cadastreValidator';
interface GeometryBody {
    geometry: Polygon | MultiPolygon;
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
        } finally {
            if (client) {
                client.release()
            }
        }
    };

    const obtiensRoleParIdLot: RequestHandler<ParamsCadastre> = async (req, res): Promise<void> => {
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
            rf.rl0101a,
            rf.rl0101e,
            rf.rl0101g,
            ST_AsGeoJSON(rf.geometry) AS geojson_geometry
        FROM public.role_foncier AS rf
        RIGHT JOIN table_assoc AS ta ON rf.id_provinc = ta.id_provinc;
      `;

            const result = await client.query<DbRole>(query, [decodedId]);
            res.json({ success: true, data: result.rows });
        } catch (err) {
            res.status(500).json({ success: false, error: 'Database error' });
        } finally {
            if (client) {
                client.release()
            }
        }
    }

    const obtiensLotsParIdQuartier: RequestHandler<ParamsQuartier> = async (req, res): Promise<void> => {
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
        } finally {
            if (client) {
                client.release()
            }
        }
    }

    const obtiensLots: RequestHandler<{}> = async (req, res, next): Promise<void> => {
        let client;
        let query: string = '';
        let ctePot = [];
        let conditions = [];
        let extraVariables = []
        let values = [];
        let joins = [];
        let replaceCount = 1;
        try {
            const { g_no_lot, bbox, superf_plus_grand, inv_plus_grand, id_quartier, estime, inv_surf_plus_grand, id_strate } = req.query;
            if (typeof bbox === 'string') {
                const bboxLimitsString = bbox.split(',')
                const bboxLimitsNum = bboxLimitsString.map((item) => Number(item))
                conditions.push(`cad.geometry && ST_MakeEnvelope($${replaceCount}, $${replaceCount + 1},  $${replaceCount + 2}, $${replaceCount + 3}, 4326)`)
                values.push(bboxLimitsNum[0])
                values.push(bboxLimitsNum[1])
                values.push(bboxLimitsNum[2])
                values.push(bboxLimitsNum[3])
                replaceCount += 4
            }
            if (typeof g_no_lot === 'string') {
                const decodedId = g_no_lot.replace(/_/g, " ");
                conditions.push(`g_no_lot = ${replaceCount}`)
                values.push(decodedId)
                replaceCount++
            }
            if (typeof superf_plus_grand === 'string') {
                conditions.push(`cad.g_va_suprf>$${replaceCount}`)
                values.push(superf_plus_grand)
                replaceCount++
            }
            if (typeof estime === 'string') {
                ctePot.push(`inventory AS (
                  SELECT
                    g_no_lot,
                    n_places_min as inv
                  FROM
                    public.inventaire_stationnement
                  WHERE methode_estime = $${replaceCount}
                )`)
                replaceCount++
                values.push(estime)
                joins.push('LEFT JOIN inventory ON inventory.g_no_lot=cad.g_no_lot')
            } else {
                ctePot.push(`inventory AS (
                  SELECT
                    g_no_lot,
                    n_places_min as inv
                  FROM
                    public.inventaire_stationnement
                  WHERE methode_estime = 2
                )`)
                joins.push('LEFT JOIN inventory ON inventory.g_no_lot=cad.g_no_lot')
                extraVariables.push('inventory.inv')
            }
            if (typeof inv_plus_grand === 'string') {
                conditions.push(`inventory.inv>$${replaceCount}`)
                extraVariables.push('inventory.inv as valeur_affich')
                values.push(inv_plus_grand)
                replaceCount++
            }
            if (typeof id_quartier === 'string') {
                joins.push(`JOIN 
                    public.sec_analyse AS polygons
                    ON ST_Intersects(cad.geometry, polygons.geometry)
                    AND polygons.id_quartier = $${replaceCount}`)
                values.push(id_quartier)
                replaceCount++
            }
            if (typeof inv_surf_plus_grand === 'string') {
                conditions.push(`inventory.inv/cad.g_va_suprf>$${replaceCount}`)
                extraVariables.push('inventory.inv/cad.g_va_suprf as valeur_affich')
                values.push(inv_surf_plus_grand)
                replaceCount++
            }
            if (typeof id_strate === 'string') {
                conditions.push(`ast.id_strate = $${replaceCount}`)
                joins.push('RIGHT JOIN assignation_strates ast ON ast.g_no_lot=cad.g_no_lot')
                values.push(id_strate)
                replaceCount++
            }

            console.log('obtention lot cadastral');
            client = await pool.connect();
            if (ctePot.length > 0) {
                const cteQuery = 'WITH ' + ctePot.join(',') + '\n'
                query += cteQuery
            }
            const baseQuerySelect = `
                SELECT 
                cad.g_no_lot,
                cad.g_nb_coord,
                cad.g_nb_coo_1,
                cad.g_va_suprf,
                EXISTS (
                        SELECT 1
                        FROM inventaire_stationnement AS inv
                        WHERE inv.g_no_lot = cad.g_no_lot
                    ) AS bool_inv,
                ST_AsGeoJSON(cad.geometry) AS geojson_geometry`
            query += baseQuerySelect
            if (extraVariables.length > 0) {
                query += ',\n' + extraVariables.join(',') + '\n'
            } else {
                query += '\n'
            }
            const baseQueryFrom = ` FROM public.cadastre cad \n`;
            query += baseQueryFrom
            if (joins.length > 0) {
                query += joins.join('\n')
            }
            if (conditions.length > 0) {
                query += ' \n WHERE ' + conditions.join(' AND ')
            }
            query += ';'    
            const result = await client.query<DbCadastre>(query, values);
            res.json({ success: true, data: result.rows });
        } catch (err) {
            res.status(500).json({ success: false, error: 'Database error' });
        } finally {
            if (client) {
                client.release()
            }
        }
    }
    // Routes
    router.get('/lot/quartier-ana/:id', obtiensLotsParIdQuartier)
    router.get('/lot-query', validateBboxQuery, obtiensLots)
    router.get('/lot/:id', obtiensLotParId)
    router.get('/role-associe/:id', obtiensRoleParIdLot)
    return router;
};