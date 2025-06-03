import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
import { DbAssociationReglementUtilSol, DbEnteteEnsembleReglement, DbUtilisationSol, DbEnteteReglement, ParamsTerritoire, ParamsRole, DbReglementComplet, ParamsEnsReg, DbCountAssoc } from '../../types/database';


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
      const{id} = req.params;
      // Parse the comma-separated IDs into an array of numbers
      const idArray = id.split(',').map(Number);
      // Dynamically create placeholders for the query (e.g., $1, $2, $3, ...)
      const placeholders = idArray.map((_, index:number) => `$${index + 1}`).join(',');

      client = await pool.connect();
      const query_1= `
        SELECT *
        FROM public.ensembles_reglements_stat
        WHERE id_er IN (${placeholders})
        ORDER BY id_er ASC
      `;

      const result_header = await client.query<DbEnteteEnsembleReglement>(query_1,idArray );
      const query2 =`
        SELECT id_assoc_er_reg, id_reg_stat,cubf,id_er
        FROM public.association_er_reg_stat
        WHERE id_er IN (${placeholders})
        ORDER BY id_assoc_er_reg  ASC
      `
      const result_rules = await client.query<DbAssociationReglementUtilSol>(query2,idArray );

      const query_3 = `
        SELECT *
        FROM public.cubf
        ORDER BY cubf ASC
      `
      const resulUtilSol = await client.query<DbUtilisationSol>(query_3 );
      const output = idArray.map((id:number) => {
        const entete = result_header.rows.find((row:DbEnteteEnsembleReglement) => row.id_er === id);
        const assoc_util_reg = result_rules.rows.filter((row:DbAssociationReglementUtilSol) => row.id_er === id);
        return {
          entete,
          assoc_util_reg,
          table_util_sol: resulUtilSol.rows
        };
      });
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

  const obtiensEntetesParTerritoire: RequestHandler<ParamsTerritoire> = async (req, res): Promise<void> => {
    console.log('Serveur - Obtention entete reglement par territoire')
    let client;
    try {
      client = await pool.connect();
      const {id} = req.params;
      const query = `
      WITH associations AS (
        SELECT 
          id_asso_er_ter,
          id_periode_geo,
          id_er
        FROM 
          public.association_er_territoire
        WHERE
          id_periode_geo = $1
      )
        SELECT
	          ers.id_er,
	          ers.description_er,
	          ers.date_debut_er,
	          ers.date_fin_er
        FROM public.ensembles_reglements_stat ers
        JOIN 
          associations ON associations.id_er = ers.id_er
        ORDER BY 
          date_debut_er ASC
      `;
      const result = await client.query<DbEnteteEnsembleReglement>(query, [id]);
      res.json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error test' });
    } finally{
      if (client){
        client.release()
      }
    }
  };

  const obtiensEnsRegCompletParRole: RequestHandler<ParamsRole> = async (req,res):Promise<void>=>{
    console.log('obtention ens-reg par role - Implémentation incomplète')
    let client;
    try{
      client = await pool.connect();
      const {id_role} = req.params;
      const query = `
        WITH role AS (
          SELECT 
            * 
          FROM
            public.role_foncier
          WHERE
            id_provinc 
          IN
           ( $1)
        ) SELECT
            role.id_provinc
          FROM 
            role
      `;
      const result = await client.query<DbReglementComplet>(query, [id_role]);
      res.json({ success: true, data: result.rows });
    }catch(err){
      res.status(500).json({ success: false, error: 'Database error test' });
    } finally{
      if (client){
        client.release()
      }
    }
  };
  const nouvelleEnteteEnsembleReglement:RequestHandler<void>=async(req,res):Promise<void>=>{
    console.log('Sauvegarde nouvelle entete ensemble reg')
    let client;
    try{
      client = await pool.connect();
      const {description_er,date_debut_er,date_fin_er} = req.body;
      const query = `
        INSERT INTO public.ensembles_reglements_stat(description_er,date_debut_er,date_fin_er)
        VALUES ($1,$2,$3)
        RETURNING *;
      `;
      const result = await client.query<DbEnteteEnsembleReglement>(query, [description_er,date_debut_er,date_fin_er]);
      res.json({ success: true, data: result.rows[0] });
    }catch(err){
      res.status(500).json({ success: false, error: 'Database error test' });
    } finally{
      if (client){
        client.release()
      }
    }
  };
  const supprimeEnsembleReglement:RequestHandler<ParamsEnsReg>=async(req,res)=>{
    console.log('Sauvegarde nouvelle entete ensemble reg')
    let client;
    try{
      client = await pool.connect();
      const {id} = req.params;
      const queryCountAssoc = `
        SELECT
          COUNT(*) as count_assoc_lines
        FROM
          public.association_er_reg_stat
        WHERE 
          id_er = $1;
      `;
      const resultCount = await client.query<DbCountAssoc>(queryCountAssoc, [id]);
      let queryHeader:string;
      let queryAssoc:string;
      let resultHeader:any;
      let resultAssoc:any;
      if (resultCount.rows[0].count_assoc_lines>0){
        queryHeader = 
          ` DELETE FROM public.ensembles_reglements_stationnement
            WHERE id_er = $1; `
        queryAssoc =
          ` DELETE FROM public.association_er_reg_stat
            WHERE id_er = $1`
        resultAssoc = await client.query(queryAssoc,[id]);
        resultHeader = await client.query(queryHeader, [id]);
      }else{
        queryHeader = 
          ` DELETE FROM public.ensembles_reglements_stationnement
            WHERE id_er = $1; `
        resultHeader = await client.query(queryHeader, [id]);
        resultAssoc = {rowCount:1}
      }
      const successHeader = resultHeader && resultAssoc.rowCount >= 0 ? true : false;
      const successAssoc = resultAssoc && resultAssoc.rowCount >= 0 ? true : false;
      res.json({ success: successHeader && successAssoc });
    }catch(err){
      res.status(500).json({ success: false, error: 'Database error test' });
    } finally{
      if (client){
        client.release()
      }
    }
  }

  // Routes
  router.get('/entete', obtiensTousEntetesEnsemblesReglements);
  router.get('/complet/:id',obtiensEnsembleReglementCompletParId)
  router.get('/regs-associes/:id',obtiensReglementsPourEnsReg);
  router.get('/entete-par-territoire/:id',obtiensEntetesParTerritoire)
  router.get('/par-role/:ids')
  router.post('/entete',nouvelleEnteteEnsembleReglement)
  router.delete('/:id',supprimeEnsembleReglement)
  return router;
};