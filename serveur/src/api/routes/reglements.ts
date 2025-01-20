import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
import { DbEnteteReglement } from 'database';


export const creationRouteurReglements = (pool: Pool): Router => {
  const router = Router();
  // Get all lines
  // Get all lines
  const obtiensTousEntetesReglements: RequestHandler = async (_req, res): Promise<void> => {
    console.log('Serveur - Obtention toutes entetes')
    try {
      const client = await pool.connect();
      const query = `
        SELECT *
        FROM public.entete_reg_stationnement
        ORDER BY id_reg_stat ASC
      `;

      const result = await client.query<DbEnteteReglement>(query, );
      res.json({ success: true, data: result.rows });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  };

  const obtiensReglementCompletParId: RequestHandler = async (req, res): Promise<void> => {
    console.log('Serveur - Obtention toutes entetes')
    try {
      const {id} = req.params;
      const client = await pool.connect();
      const query1 = `
        SELECT *
        FROM public.entete_reg_stationnement
        WHERE id_reg_stat = $1
        ORDER BY id_reg_stat ASC
      `;

      const result_header = await client.query<DbEnteteReglement>(query1,[id] );
      const query2 =`
        SELECT * 
        FROM public.reg_stationnement_empile
        WHERE id_reg_stat = $1
        ORDER BY id_reg_stat_emp ASC
      `
      const result_rules = await client.query<DbEnteteReglement>(query2,[id] );
      const output={
        entete: result_header.rows[0],
        definition: result_rules.rows
      }
      res.json({ success: true, data: output });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  };



  // Routes
  router.get('/entete', obtiensTousEntetesReglements);
  router.get('/complet/:id',obtiensReglementCompletParId)

  return router;
};