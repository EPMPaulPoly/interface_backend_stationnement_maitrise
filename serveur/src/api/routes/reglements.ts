import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
import { DbDefReglement, DbEnteteReglement, DbReglementComplet } from 'database';


export const creationRouteurReglements = (pool: Pool): Router => {
  const router = Router();
  // Get all lines
  // Get all lines
  const obtiensTousEntetesReglements: RequestHandler = async (_req, res): Promise<void> => {
    console.log('Serveur - Obtention toutes entetes')
    let client;
    try {
      client = await pool.connect();
      const query = `
        SELECT *
        FROM public.entete_reg_stationnement
        ORDER BY id_reg_stat ASC
      `;

      const result = await client.query<DbEnteteReglement>(query,);
      res.json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    } finally{
      if (client) {
        client.release(); // Release the connection back to the pool
      }
    }
  };

  const obtiensReglementCompletParId: RequestHandler = async (req, res): Promise<void> => {
    console.log('Serveur - Obtention reg complet par id')
    let client;
    try {
      client = await pool.connect();
      const{idToSplit} = req.params;
      // Parse the comma-separated IDs into an array of numbers
      const idArray = idToSplit.split(',').map(Number);

      // Dynamically create placeholders for the query (e.g., $1, $2, $3, ...)
      const placeholders = idArray.map((_, index:number) => `$${index + 1}`).join(',');

      // Query to fetch headers
      const query1 = `
        SELECT *
        FROM public.entete_reg_stationnement
        WHERE id_reg_stat IN (${placeholders})
        ORDER BY id_reg_stat ASC
      `;
      const result_header = await client.query<DbEnteteReglement>(query1, idArray);

      // Query to fetch rules
      const query2 = `
        SELECT * 
        FROM public.reg_stationnement_empile
        WHERE id_reg_stat IN (${placeholders})
        ORDER BY id_reg_stat_emp ASC
      `;
      const result_rules = await client.query<DbDefReglement>(query2, idArray);

      // Group rules by `id_reg_stat` for efficient access
      const rulesById = new Map<number, DbDefReglement[]>();
      result_rules.rows.forEach((rule:DbDefReglement) => {
        if (!rulesById.has(rule.id_reg_stat)) {
          rulesById.set(rule.id_reg_stat, []);
        }
        rulesById.get(rule.id_reg_stat)?.push(rule);
      });

      // Combine headers with their corresponding rules
      const output_2: DbReglementComplet[] = result_header.rows.map((header:DbEnteteReglement) => ({
        entete: header,
        definition: rulesById.get(header.id_reg_stat) || [], // Default to an empty array if no rules match
      }));

      res.json({ success: true, data: output_2 });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    } finally{
      if (client) {
        client.release(); // Release the connection back to the pool
      }
    }
  };



  // Routes
  router.get('/entete', obtiensTousEntetesReglements);
  router.get('/complet/:idToSplit', obtiensReglementCompletParId);

  return router;
};