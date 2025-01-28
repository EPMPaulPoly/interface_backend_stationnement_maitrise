import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
import { DbAssociationReglementUtilSol, DbEnteteEnsembleReglement, DbUtilisationSol, DbEnteteReglement } from 'database';


export const creationRouteurEnsemblesReglements = (pool: Pool): Router => {
  const router = Router();
  // Get all lines
  const obtiensTousEntetesEnsemblesReglements: RequestHandler = async (_req, res): Promise<void> => {
    console.log('Serveur - Obtention toutes entetes ensembles reglements')
    let client;
    try {
      client = await pool.connect();
      const query = `
        SELECT *
        FROM public.ensembles_reglements_stat
        ORDER BY id_er ASC
      `;

      const result = await client.query<DbEnteteEnsembleReglement>(query, );
      res.json({ success: true, data: result.rows });
      client.release();
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error test' });
    } finally{
      if (client){
        client.release()
      }
    }
  };

  const obtiensEnsembleReglementCompletParId: RequestHandler = async (req, res): Promise<void> => {
    console.log('Serveur - Obtention ensembles reglements complets')
    let client;
    try {
      const {id} = req.params;
      client = await pool.connect();
      const query_1= `
        SELECT *
        FROM public.ensembles_reglements_stat
        WHERE id_er = $1
        ORDER BY id_er ASC
      `;

      const result_header = await client.query<DbEnteteEnsembleReglement>(query_1,[id] );
      const query2 =`
        SELECT id_assoc_er_reg, id_reg_stat,cubf
        FROM public.association_er_reg_stat
        WHERE id_er = $1
        ORDER BY id_assoc_er_reg  ASC
      `
      const result_rules = await client.query<DbAssociationReglementUtilSol>(query2,[id] );

      const query_3 = `
        SELECT *
        FROM public.cubf
        ORDER BY cubf ASC
      `
      const resulUtilSol = await client.query<DbUtilisationSol>(query_3 );
      const output={
        entete: result_header.rows[0],
        assoc_util_reg: result_rules.rows,
        table_util_sol:resulUtilSol.rows
      }
      res.json({ success: true, data: output });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    } finally{
      if (client){
        client.release()
      }
    }
  };

  const obtiensReglementsPourEnsReg: RequestHandler = async (req, res): Promise<void> => {
    console.log('Serveur - Obtention entetes de reglements associés à un ensemble de règlements')
    let client;
    try {
      const {id} = req.params;
      client = await pool.connect();
      const query_1= `
        WITH reg_pert AS(
          SELECT DISTINCT id_reg_stat
          from public.association_er_reg_stat
          where id_er = $1
        )

        SELECT * 
        FROM public.entete_reg_stationnement
        where id_reg_stat in (SELECT id_reg_stat from reg_pert)
      `;

      const result_header = await client.query<DbEnteteReglement>(query_1,[id] );

      res.json({ success: true, data: result_header.rows });
      
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    } finally{
      if (client){
        client.release()
      }
    }
  };


  // Routes
  router.get('/entete', obtiensTousEntetesEnsemblesReglements);
  router.get('/complet/:id',obtiensEnsembleReglementCompletParId)
  router.get('/regs-associes/:id',obtiensReglementsPourEnsReg);

  return router;
};