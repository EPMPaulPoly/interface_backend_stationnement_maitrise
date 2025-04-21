import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
import { DbTerritoire, ParamsCadastre, ParamsPeriode,DbRole,DbCadastre,ParamsQuartier,DbCadastreGeomIdOnly } from '../../types/database';
// Types pour les requêtes
import { Polygon,MultiPolygon } from 'geojson';
import { ParamsTerritoire } from '../../types/database';
import {XYVariableInfo,TableDef} from '../../types/maps'
interface GeometryBody {
  geometry: Polygon|MultiPolygon;  
}

export const creationRouteurAnalyseParQuartiers = (pool: Pool): Router => {
  const router = Router();
  const variableMap: Record<string, XYVariableInfo> = {
    'stat-tot': {
      expression: (ordre) => `stag.inv_${getValidatedOrdre(ordre)}`,
      joins:['stat_agrege stag ON sa.id_quartier::int=stag.id_quartier::int'],
      description: 'Stationnement Total',
      requiresOrdre: true
    },
    'stat-sup': {
      expression: (ordre) => `(stag.inv_${getValidatedOrdre(ordre)} / NULLIF(sa.superf_quartier/100000, 0))::float`,
      joins:['stat_agrege stag ON sa.id_quartier::int=stag.id_quartier::int'],
      description: 'Stationnement par mètre carré',
      requiresOrdre: true
    },
    'stat-popu': {
      expression: (ordre) => `(stag.inv_${getValidatedOrdre(ordre)} / NULLIF(pq.pop_tot_2021, 0))::float`,
      joins:['stat_agrege stag ON sa.id_quartier=stag.id_quartier','population_par_quartier pq on sa.id_quartier::int=pq.id_quartier::int'],
      description: 'Stationnement par personne',
      requiresOrdre: true
    },
    'stat-voit': {
      expression: (ordre) => `(stag.inv_${getValidatedOrdre(ordre)} / NULLIF(mq.nb_voitures, 0))::float`,
      joins:['stat_agrege stag ON sa.id_quartier=stag.id_quartier','motorisation_par_quartier mq on sa.id_quartier::int=mq.id_quartier::int'],
      description: 'Stationnement par voiture résident',
      requiresOrdre: true
    },
    'stat-perc': {
      expression: (ordre) => `(stag.inv_${getValidatedOrdre(ordre)}*15 / NULLIF(sa.superf_quartier, 0))::float`,
      joins:['stat_agrege stag ON sa.id_quartier::int=stag.id_quartier::int'],
      description: 'Pourcentage territoire dédié au stationnement',
      requiresOrdre: true
    },
    'superf': {
      expression: () => `sa.superf_quartier/1000000`,
      joins:[],
      description: 'Superficie Quartier',
      requiresOrdre: false
    },
    'popu': {
      expression: () => `pq.pop_tot_2021`,
      joins:['population_par_quartier pq on sa.id_quartier::int=pq.id_quartier::int'],
      description: 'Population',
      requiresOrdre: false
    },
    'voit':{
      expression: () => `pq.nb_voitures`,
      joins:['motorisation_par_quartier pq on sa.id_quartier::int=pq.id_quartier::int'],
      description: 'Population',
      requiresOrdre: false
    },
    'dens-pop': {
      expression: () => `(pq.pop_tot_2021 / NULLIF(sa.superf_quartier/1000000, 0))::float`,
      joins: ['population_par_quartier pq on sa.id_quartier::int=pq.id_quartier::int'],
      description: 'Densité Population',
      requiresOrdre: false
    },
    'val-log-moy': {
      expression: () => `dfa.valeur_moyenne_logement`,
      joins: ['donnees_foncieres_agregees dfa on sa.id_quartier::int=dfa.id_quartier::int'],
      description: 'Valeur moyenne des logements',
      requiresOrdre: false
    },
    'sup-log-moy': {
      expression: () => `dfa.superf_moyenne_logement`,
      joins: ['donnees_foncieres_agregees dfa on sa.id_quartier::int=dfa.id_quartier::int'],
      description: 'Superficie moyenne des logements',
      requiresOrdre: false
    },
    'val-tot-quart': {
      expression: () => `dfa.valeur_fonciere_totale`,
      joins: ['donnees_foncieres_agregees dfa on sa.id_quartier::int=dfa.id_quartier::int'],
      description: 'Valeur Foncière totale',
      requiresOrdre: false
    },
    'val-tot-log-quart':{
      expression: () => `dfa.valeur_fonciere_logement_totale`,
      joins: ['donnees_foncieres_agregees dfa on sa.id_quartier::int=dfa.id_quartier::int'],
      description: 'Valeur Foncière totale',
      requiresOrdre: false
    },
    'val-tot-sup': {
      expression: () => `(dfa.valeur_totale / NULLIF(sa.superf_quartier, 0))::float`,
      joins: ['donnees_foncieres_agregees dfa on sa.id_quartier::int=dfa.id_quartier::int'],
      description: 'Valeur Foncière par superficie',
      requiresOrdre: false
    },
    'nb-voit':{
      expression: () => `(mq.nb_voitures)::float`,
      joins: ['motorisation_par_quartier mq on sa.id_quartier::int=mq .id_quartier::int'],
      description: 'Nombre de voitures',
      requiresOrdre: false
    }
  };

  const validOrdres = ['123', '132', '213', '231', '312', '321'];

  const getValidatedOrdre = (ordre: string|undefined): string  => {
    const ordreValue = ordre ?? '132';
    const cleaned = ordreValue.replace(/[^0-9]/g, ''); // remove anything sketchy

    if (validOrdres.includes(cleaned)) {
      return cleaned;
    }
    return ordreValue;
  };

  const obtiensStationnementTotalParQuartierCarto : RequestHandler<ParamsTerritoire> = async (req, res): Promise<void> => {
    let client;
    try {
      const { ordreEstime } = req.params;
      const numbers: number[] = ordreEstime.split(",").map(Number);
      const selectedIds = numbers.slice(0, 3);
      const stringForReq = selectedIds.map(String).join('');
      console.log('Obtention stationnement agrégé par quartier');
      client = await pool.connect();
      const query = `
        SELECT 
            id_quartier,
            nom_quartier,
            'Stationnement Total du Quartier' AS description,
            inv_${stringForReq} AS valeur,
            superf_quartier,
            ST_AsGeoJSON(geom) AS geojson_geometry
        FROM public.stat_agrege 
        ORDER BY id_quartier;
      `;

      const result = await client.query(query);
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
      const stringForReq = selectedIds.map(String).join('');
      console.log('Obtention stationnement agrégé par quartier divisé par superficie');
      client = await pool.connect();
      const query = `
        SELECT 
            id_quartier,
            nom_quartier,
            'Stationnement par mètre carré' AS description,
            inv_${stringForReq} / superf_quartier AS valeur,
            superf_quartier,
            ST_AsGeoJSON(geom) AS geojson_geometry
        FROM public.stat_agrege 
        ORDER BY id_quartier;
      `;

      const result = await client.query(query);
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
      const stringForReq = selectedIds.map(String).join('');
      console.log('Obtention stationnement agrégé par quartier divisé par superficie fois aire stat moyenne');
      client = await pool.connect();
      const query = `
        SELECT 
            id_quartier,
            nom_quartier,
            'Pourcent secteur stationnement' AS description,
            (inv_${stringForReq} * 15 *100) / superf_quartier AS valeur,
            superf_quartier,
            ST_AsGeoJSON(geom) AS geojson_geometry
        FROM public.stat_agrege 
        ORDER BY id_quartier;
      `;
      const result = await client.query(query);
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
  const obtiensStationnementParVoitureCarto: RequestHandler<ParamsTerritoire>  = async (req, res): Promise<void> => {
    let client;
    try {
      const { ordreEstime } = req.params;
      const numbers: number[] = ordreEstime.split(",").map(Number);
      const selectedIds = numbers.slice(0, 3);
      const stringForReq = selectedIds.map(String).join('');
      console.log('Obtention stationnement agrégé par voiture résident');
      client = await pool.connect();
      const query = `
        SELECT 
            sa.id_quartier,
            sa.nom_quartier,
            'Places par voiture residents' AS description,
            (sa.inv_${stringForReq} ) / mq.nb_voitures AS valeur,
            sa.superf_quartier,
            ST_AsGeoJSON(sa.geom) AS geojson_geometry
        FROM public.stat_agrege sa
        LEFT JOIN motorisation_par_quartier mq on sa.id_quartier::bigint = mq.id_quartier
        ORDER BY id_quartier;
      `;
      const result = await client.query(query);
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
  const obtiensStationnementParPersonneCarto: RequestHandler<ParamsTerritoire>  = async (req, res): Promise<void> => {
    let client;
    try {
      const { ordreEstime } = req.params;
      const numbers: number[] = ordreEstime.split(",").map(Number);
      const selectedIds = numbers.slice(0, 3);
      const stringForReq = selectedIds.map(String).join('');
      console.log('Obtention stationnement agrégé par personne');
      client = await pool.connect();
      const query = `
        SELECT 
            sa.id_quartier,
            sa.nom_quartier,
            'Places par resident' AS description,
            (sa.inv_${stringForReq} ) / mq.pop_tot_2021 AS valeur,
            sa.superf_quartier,
            ST_AsGeoJSON(sa.geom) AS geojson_geometry
        FROM public.stat_agrege sa
        LEFT JOIN population_par_quartier mq on sa.id_quartier::bigint = mq.id_quartier
        ORDER BY id_quartier;
      `;
      const result = await client.query(query);
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
  const recalculeStationnementAgrege: RequestHandler<void> = async(_req,res): Promise<void>=>{
    
    let client
    try {
      console.log('Recalcul du stationnement en cours');
      client = await pool.connect();
      const query = `
        DELETE FROM stat_agrege;
        WITH LotNeighborhood AS (
          SELECT 
            c.g_no_lot, 
            s.id_quartier,
            s.superf_quartier,
            s.geometry,
            s.nom_quartier
          FROM public.cadastre c
          JOIN public.sec_analyse s 
            ON ST_Area(ST_Intersection(s.geometry, c.geometry)) / ST_Area(c.geometry) > 0.9
        ),

        inv_123 AS (
          SELECT ln.id_quartier, ln.geometry, ln.superf_quartier, ln.nom_quartier,
                CEIL(SUM(COALESCE(sub.parking_estimate, 0))) AS inv_123
          FROM LotNeighborhood ln
          LEFT JOIN LATERAL (
            SELECT 
              COALESCE(
                CASE WHEN i.methode_estime = 1 THEN i.n_places_mesure
                    ELSE i.n_places_min
                END, 0
              ) AS parking_estimate
            FROM inventaire_stationnement i
            WHERE i.g_no_lot = ln.g_no_lot
            ORDER BY CASE i.methode_estime
                      WHEN 1 THEN 1
                      WHEN 2 THEN 2
                      WHEN 3 THEN 3
                      ELSE 4
                    END
            LIMIT 1
          ) sub ON true
          GROUP BY ln.id_quartier, ln.geometry, ln.superf_quartier,ln.nom_quartier
        ),

        inv_132 AS (
          SELECT ln.id_quartier, ln.geometry, ln.superf_quartier, 
                CEIL(SUM(COALESCE(sub.parking_estimate, 0))) AS inv_132
          FROM LotNeighborhood ln
          LEFT JOIN LATERAL (
            SELECT 
              COALESCE(
                CASE WHEN i.methode_estime = 1 THEN i.n_places_mesure
                    ELSE i.n_places_min
                END, 0
              ) AS parking_estimate
            FROM inventaire_stationnement i
            WHERE i.g_no_lot = ln.g_no_lot
            ORDER BY CASE i.methode_estime
                      WHEN 1 THEN 1
                      WHEN 3 THEN 2
                      WHEN 2 THEN 3
                      ELSE 4
                    END
            LIMIT 1
          ) sub ON true
          GROUP BY ln.id_quartier, ln.geometry, ln.superf_quartier
        ),

        inv_213 AS (
          SELECT ln.id_quartier, ln.geometry, ln.superf_quartier, 
                CEIL(SUM(COALESCE(sub.parking_estimate, 0))) AS inv_213
          FROM LotNeighborhood ln
          LEFT JOIN LATERAL (
            SELECT 
              COALESCE(
                CASE WHEN i.methode_estime = 2 THEN i.n_places_min
                    WHEN i.methode_estime = 1 THEN i.n_places_mesure
                    ELSE i.n_places_min
                END, 0
              ) AS parking_estimate
            FROM inventaire_stationnement i
            WHERE i.g_no_lot = ln.g_no_lot
            ORDER BY CASE i.methode_estime
                      WHEN 2 THEN 1
                      WHEN 1 THEN 2
                      WHEN 3 THEN 3
                      ELSE 4
                    END
            LIMIT 1
          ) sub ON true
          GROUP BY ln.id_quartier, ln.geometry, ln.superf_quartier
        ),

        inv_231 AS (
          SELECT ln.id_quartier, ln.geometry, ln.superf_quartier, 
                CEIL(SUM(COALESCE(sub.parking_estimate, 0))) AS inv_231
          FROM LotNeighborhood ln
          LEFT JOIN LATERAL (
            SELECT 
              COALESCE(
                CASE WHEN i.methode_estime = 2 THEN i.n_places_min
                    WHEN i.methode_estime = 1 THEN i.n_places_mesure
                    ELSE i.n_places_min
                END, 0
              ) AS parking_estimate
            FROM inventaire_stationnement i
            WHERE i.g_no_lot = ln.g_no_lot
            ORDER BY CASE i.methode_estime
                      WHEN 2 THEN 1
                      WHEN 3 THEN 2
                      WHEN 1 THEN 3
                      ELSE 4
                    END
            LIMIT 1
          ) sub ON true
          GROUP BY ln.id_quartier, ln.geometry, ln.superf_quartier
        ),

        inv_312 AS (
          SELECT ln.id_quartier, ln.geometry, ln.superf_quartier, 
                CEIL(SUM(COALESCE(sub.parking_estimate, 0))) AS inv_312
          FROM LotNeighborhood ln
          LEFT JOIN LATERAL (
            SELECT 
              COALESCE(
                CASE WHEN i.methode_estime = 3 THEN i.n_places_min
                    WHEN i.methode_estime = 1 THEN i.n_places_mesure
                    ELSE i.n_places_min
                END, 0
              ) AS parking_estimate
            FROM inventaire_stationnement i
            WHERE i.g_no_lot = ln.g_no_lot
            ORDER BY CASE i.methode_estime
                      WHEN 3 THEN 1
                      WHEN 1 THEN 2
                      WHEN 2 THEN 3
                      ELSE 4
                    END
            LIMIT 1
          ) sub ON true
          GROUP BY ln.id_quartier, ln.geometry, ln.superf_quartier
        ),

        inv_321 AS (
          SELECT ln.id_quartier, ln.geometry, ln.superf_quartier, 
                CEIL(SUM(COALESCE(sub.parking_estimate, 0))) AS inv_321
          FROM LotNeighborhood ln
          LEFT JOIN LATERAL (
            SELECT 
              COALESCE(
                CASE WHEN i.methode_estime = 3 THEN i.n_places_min
                    WHEN i.methode_estime = 2 THEN i.n_places_min
                    ELSE i.n_places_mesure
                END, 0
              ) AS parking_estimate
            FROM inventaire_stationnement i
            WHERE i.g_no_lot = ln.g_no_lot
            ORDER BY CASE i.methode_estime
                      WHEN 3 THEN 1
                      WHEN 2 THEN 2
                      WHEN 1 THEN 3
                      ELSE 4
                    END
            LIMIT 1
          ) sub ON true
          GROUP BY ln.id_quartier, ln.geometry, ln.superf_quartier
        )


        -- Final merge + insert
        INSERT INTO stat_agrege (
          id_quartier, geom, superf_quartier,nom_quartier,
          inv_123, inv_132, inv_213, inv_231, inv_312, inv_321
        )
        SELECT 
          i123.id_quartier,
          i123.geometry,
          i123.superf_quartier,
          i123.nom_quartier,
          i123.inv_123,
          i132.inv_132,
          i213.inv_213,
          i231.inv_231,
          i312.inv_312,
          i321.inv_321
        FROM inv_123 i123
        LEFT JOIN inv_132 i132 ON i123.id_quartier = i132.id_quartier
        LEFT JOIN inv_213 i213 ON i123.id_quartier = i213.id_quartier
        LEFT JOIN inv_231 i231 ON i123.id_quartier = i231.id_quartier
        LEFT JOIN inv_312 i312 ON i123.id_quartier = i312.id_quartier
        LEFT JOIN inv_321 i321 ON i123.id_quartier = i321.id_quartier;
      `;
      const result = await client.query(query);
      res.json({ success: true});
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
      console.log('Enjeux dans l agregation du stationnement')
    } finally{
      if (client){
        client.release()
      }
    }
  }
  const obtiensStationnementTotalParQuartierHisto : RequestHandler<ParamsTerritoire> = async (req, res): Promise<void> => {
    let client;
    try {
      const { ordreEstime } = req.params;
      const numbers: number[] = ordreEstime.split(",").map(Number);
      const selectedIds = numbers.slice(0, 3);
      const stringForReq = selectedIds.map(String).join('');
      console.log('Obtention stationnement agrégé par quartier');
      client = await pool.connect();
      const query = `
        SELECT 
            id_quartier::int,
            nom_quartier,
            inv_${stringForReq} AS valeurs
        FROM public.stat_agrege 
        ORDER BY id_quartier;
      `;

      const result = await client.query(query);
      const valeurVille = result.rows.reduce((sum, row) => sum + (row.valeurs || 0), 0);
      const data_output = {valeurVille:valeurVille,description:'Stationnement total',donnees:result.rows}
      res.json({ success: true, data: data_output });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
      console.log('fourré dans la fonction obtention')
    } finally{
      if (client){
        client.release()
      }
    }
  };
  const obtiensStationnementParSuperfParQuartierHisto : RequestHandler<ParamsTerritoire> = async (req, res): Promise<void> => {
    let client;
    try {
      const { ordreEstime } = req.params;
      const numbers: number[] = ordreEstime.split(",").map(Number);
      const selectedIds = numbers.slice(0, 3);
      const stringForReq = selectedIds.map(String).join('');
      console.log('Obtention stationnement agrégé par quartier divisé par superficie');
      client = await pool.connect();
      const query = `
        SELECT 
            id_quartier::int,
            nom_quartier,
            inv_${stringForReq} / superf_quartier AS valeurs
        FROM public.stat_agrege 
        ORDER BY id_quartier;
      `;
      const query2 = `
        SELECT 
          SUM(inv_${stringForReq}) / SUM(superf_quartier) AS valeur
        FROM public.stat_agrege 
      `;

      const result = await client.query(query);
      const result2 = await client.query(query2)
      const data_output = {valeurVille:result2.rows[0].valeur,description:'Stationnement par metre carre',donnees:result.rows}
      res.json({ success: true, data: data_output});
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
      console.log('fourré dans la fonction obtention')
    } finally{
      if (client){
        client.release()
      }
    }
  };

  const obtiensStationnementPourcentParQuartierHisto : RequestHandler<ParamsTerritoire> = async (req, res): Promise<void> => {
    let client;
    try {
      const { ordreEstime } = req.params;
      const numbers: number[] = ordreEstime.split(",").map(Number);
      const selectedIds = numbers.slice(0, 3);
      const stringForReq = selectedIds.map(String).join('');
      console.log('Obtention stationnement agrégé par quartier divisé par superficie fois aire stat moyenne');
      client = await pool.connect();
      const query = `
        SELECT 
            id_quartier::int,
            nom_quartier,
            (inv_${stringForReq} * 15 *100) / superf_quartier AS valeurs
        FROM public.stat_agrege 
        ORDER BY id_quartier;
      `;
      const query2 = `
        SELECT 
          SUM(inv_${stringForReq}* 15 *100) / SUM(superf_quartier) AS valeur
        FROM public.stat_agrege 
      `;
      const result = await client.query(query);
      const result2 = await client.query(query2)
      const data_output = {valeurVille:result2.rows[0].valeur,description:'Pourcentage aire ville',donnees:result.rows}
      res.json({ success: true, data: data_output });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
      console.log('fourré dans la fonction obtention pourcentage')
    } finally{
      if (client){
        client.release()
      }
    }
  };
  const obtiensStationnementParVoitureHisto: RequestHandler<ParamsTerritoire>  = async (req, res): Promise<void> => {
    let client;
    try {
      const { ordreEstime } = req.params;
      const numbers: number[] = ordreEstime.split(",").map(Number);
      const selectedIds = numbers.slice(0, 3);
      const stringForReq = selectedIds.map(String).join('');
      console.log('Obtention stationnement agrégé par voiture résident');
      client = await pool.connect();
      const query = `
        SELECT 
            sa.id_quartier::int,
            sa.nom_quartier,
            (sa.inv_${stringForReq} ) / mq.nb_voitures AS valeurs
        FROM public.stat_agrege sa
        LEFT JOIN motorisation_par_quartier mq on sa.id_quartier::bigint = mq.id_quartier
        ORDER BY id_quartier;
      `;
      const query2 = `
        SELECT 
            SUM(sa.inv_${stringForReq} ) / SUM(mq.nb_voitures) AS valeur
        FROM public.stat_agrege sa
        LEFT JOIN motorisation_par_quartier mq on sa.id_quartier::bigint = mq.id_quartier
      `;
      const result = await client.query(query);
      
      const result2 = await client.query(query2);
      const data_output = {valeurVille:result2.rows[0].valeur,description:'Stationnement par voiture',donnees:result.rows}
      res.json({ success: true, data: data_output });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
      console.log('fourré dans la fonction obtention pourcentage')
    } finally{
      if (client){
        client.release()
      }
    }
  };
  const obtiensStationnementParPersonneHisto: RequestHandler<ParamsTerritoire>  = async (req, res): Promise<void> => {
    let client;
    try {
      const { ordreEstime } = req.params;
      const numbers: number[] = ordreEstime.split(",").map(Number);
      const selectedIds = numbers.slice(0, 3);
      const stringForReq = selectedIds.map(String).join('');
      console.log('Obtention stationnement agrégé par personne');
      client = await pool.connect();
      const query = `
        SELECT 
            sa.id_quartier::int,
            sa.nom_quartier,
            ((sa.inv_${stringForReq} ) / mq.pop_tot_2021)::float AS valeurs
        FROM public.stat_agrege sa
        LEFT JOIN population_par_quartier mq on sa.id_quartier::bigint = mq.id_quartier
        ORDER BY id_quartier;
      `;
      const query2 = `
        SELECT 
            (SUM(sa.inv_${stringForReq} ) / SUM(mq.pop_tot_2021))::float AS valeur
        FROM public.stat_agrege sa
        LEFT JOIN population_par_quartier mq on sa.id_quartier::bigint = mq.id_quartier
      `;
      const result = await client.query(query);
      const result2 = await client.query(query2);
      const data_output = {valeurVille:result2.rows[0].valeur,description:'Stationnement par résident',donnees:result.rows}
      res.json({ success: true, data: data_output });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
      console.log('fourré dans la fonction obtention pourcentage')
    } finally{
      if (client){
        client.release()
      }
    }
  };

  
  const getQueryForXY = (
    variableKey: string,
    ordre?: string
  ): { expression: string, joins: string[], description: string } => {
    const config = variableMap[variableKey];
    if (!config) throw new Error(`Variable ${variableKey} not found`);
  
    const ordreValue = ordre ?? ''; // Provide a fallback if ordre is undefined
    if (config.requiresOrdre && !ordreValue) {
      throw new Error(`Variable ${variableKey} requires ordre`);
    }
  
    const expr = config.expression(ordreValue);
    return { expression: expr, joins: config.joins, description: config.description };
  };

  const obtiensDonneesGraphiqueXY: RequestHandler<ParamsTerritoire> = async (req, res): Promise<void> => {
    let client;
    try {
      const { ordre, X, Y } = req.query;
      if (typeof X === 'string' && typeof Y === 'string') {
        // Get the query fragments based on X and Y
        let xQueryFragment ;
        let yQueryFragment ;
        if (typeof ordre ==='string'){
          xQueryFragment = getQueryForXY(X, ordre);
          yQueryFragment = getQueryForXY(Y, ordre);
        } else{
          xQueryFragment = getQueryForXY(X);
          yQueryFragment = getQueryForXY(Y);
        }
        // Get the join fragments for X and Y
        const Xjoins = xQueryFragment.joins
        const Yjoins = yQueryFragment.joins

        const allJoins =Xjoins.concat(Yjoins)
        const uniqueJoins = [...new Set(allJoins)];


          // Query for detailed data, including the necessary joins for both X and Y
          const query = `
            SELECT 
              sa.id_quartier::int,
              sa.nom_quartier,
              ${xQueryFragment.expression}::float AS X,
              ${yQueryFragment.expression}::float AS Y
            FROM public.sec_analyse sa
            ${uniqueJoins.map((join)=> `LEFT JOIN  ${join}`).join('\n')}
            ORDER BY sa.id_quartier;
          `;

          console.log('Executing query for', X, Y);

          
          // Database connection
          client = await pool.connect();
  
          // Queries

          // Execute queries
          const result = await client.query(query);
          const output = {descriptionX:`${xQueryFragment.description}`,descriptionY: `${yQueryFragment.description}`, donnees:result.rows}
  
          res.json({ success: true, data: output });
        }
    } catch (err) {
      // Error handling
      res.status(500).json({ success: false, error: 'Database error' });
      console.log('Error in data retrieval for percentage calculation:', err);
    } finally {
      // Ensure client release in case of error or success
      if (client) {
        client.release();
      }
    }
  };
  // Routes
  router.get('/carto/stat-tot/:ordreEstime',obtiensStationnementTotalParQuartierCarto)
  router.get('/carto/stat-sup/:ordreEstime',obtiensStationnementParSuperfParQuartierCarto)
  router.get('/carto/stat-perc/:ordreEstime',obtiensStationnementPourcentParQuartierCarto)
  router.get('/carto/stat-voit/:ordreEstime',obtiensStationnementParVoitureCarto)
  router.get('/carto/stat-popu/:ordreEstime',obtiensStationnementParPersonneCarto)
  router.get('/histo/stat-tot/:ordreEstime',obtiensStationnementTotalParQuartierHisto)
  router.get('/histo/stat-sup/:ordreEstime',obtiensStationnementParSuperfParQuartierHisto)
  router.get('/histo/stat-perc/:ordreEstime',obtiensStationnementPourcentParQuartierHisto)
  router.get('/histo/stat-voit/:ordreEstime',obtiensStationnementParVoitureHisto)
  router.get('/histo/stat-popu/:ordreEstime',obtiensStationnementParPersonneHisto)
  router.get('/XY',obtiensDonneesGraphiqueXY)
  router.get('/recalcule-stat-agreg',recalculeStationnementAgrege)
  return router;
};