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



  // Routes
  router.get('/entete', obtiensTousEntetesReglements);

  return router;
};