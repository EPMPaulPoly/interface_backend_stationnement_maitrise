import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
import { DbDefReglement, DbEnteteReglement, DbReglementComplet } from '../../types/database';
import path from 'path';
import { spawn } from 'child_process';


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

      const result = await client.query(query);
      res.json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    } finally {
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
      const { idToSplit } = req.params;
      // Parse the comma-separated IDs into an array of numbers
      const idArray = idToSplit.split(',').map(Number);

      // Dynamically create placeholders for the query (e.g., $1, $2, $3, ...)
      const placeholders = idArray.map((_, index: number) => `$${index + 1}`).join(',');

      // Query to fetch headers
      const query1 = `
        SELECT *
        FROM public.entete_reg_stationnement
        WHERE id_reg_stat IN (${placeholders})
        ORDER BY id_reg_stat ASC
      `;
      const result_header = await client.query(query1, idArray);

      // Query to fetch rules
      const query2 = `
        SELECT * 
        FROM public.reg_stationnement_empile
        WHERE id_reg_stat IN (${placeholders})
        ORDER BY id_reg_stat_emp ASC
      `;
      const result_rules = await client.query(query2, idArray);

      // Group rules by `id_reg_stat` for efficient access
      const rulesById = new Map<number, DbDefReglement[]>();
      result_rules.rows.forEach((rule: DbDefReglement) => {
        if (!rulesById.has(rule.id_reg_stat)) {
          rulesById.set(rule.id_reg_stat, []);
        }
        rulesById.get(rule.id_reg_stat)?.push(rule);
      });

      // Combine headers with their corresponding rules
      const output_2: DbReglementComplet[] = result_header.rows.map((header: DbEnteteReglement) => ({
        entete: header,
        definition: rulesById.get(header.id_reg_stat) || [], // Default to an empty array if no rules match
      }));

      res.json({ success: true, data: output_2 });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    } finally {
      if (client) {
        client.release(); // Release the connection back to the pool
      }
    }
  };

  const obtiensUnitesParLot: RequestHandler = async (req, res): Promise<void> => {

    const { id } = req.params;
    const decipheredId = id.replace(/_/g, " ");
    console.log(`obtention des unités pour les règlements s'appliquant au lot : ${decipheredId}`)
    const scriptPath = path.resolve(__dirname, "../../../../serveur_calcul_python/obtention_reglements_lot.py");

    // Chemin direct vers l'interpréteur Python dans l'environnement Conda
    const pythonExecutable = '/opt/conda/envs/serveur_calcul_python/bin/python3';

    // Exécuter le script Python avec l'interpréteur de l'environnement
    const pythonProcess = spawn(pythonExecutable, [scriptPath, decipheredId]);
    let outputData = '';
    let errorData = '';

    // Capturer l'output standard
    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });

    // Capturer les erreurs standard
    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    // Capturer la fin du processus
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        //console.log(`Output: ${outputData}`)
        console.log(`Processus enfant terminé avec succès.`);
        try {
          // 🔹 Extract JSON by finding the first `{` (start of JSON)
          const jsonStartIndex = outputData.indexOf('[');
          if (jsonStartIndex !== -1) {
            const jsonString = outputData.slice(jsonStartIndex).trim();
            const jsonData = JSON.parse(jsonString);

            //console.log('Parsed JSON:', jsonData);
            return res.status(200).json({ success: true, data: jsonData });  //  Send JSON response
          } else {
            console.error('No JSON found in output:', outputData);
            return res.status(500).send('Erreur: No valid JSON found in output.');
          }
        } catch (err) {
          console.error('Failed to parse JSON:', err);
          return res.status(500).send('Erreur: JSON parsing failed.');
        }
      } else {
        console.error(`Processus enfant échoué avec le code : ${code}`);
        return res.status(500).send(`Erreur: ${errorData}`);
      }
    });
  };

  const nouvelEnteteReglement: RequestHandler = async (req, res, next): Promise<void> => {
    let client;
    try {
      const { description, annee_debut_reg, annee_fin_reg, texte_loi, article_loi, paragraphe_loi, ville } = req.body;
      client = await pool.connect();
      const query = `INSERT INTO public.entete_reg_stationnement(description,annee_debut_reg,annee_fin_reg,texte_loi,article_loi,paragraphe_loi,ville)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *;`
      const response = await client.query(query, [description, annee_debut_reg, annee_fin_reg, texte_loi, article_loi, paragraphe_loi, ville])
      if (response.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Entry not found' });
        return;
      }
      res.json({ success: true, data: response.rows });
    } catch (err) {
      next(err);
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  const supprimeReglement: RequestHandler = async (req, res, next): Promise<void> => {
    let client;
    try {
      const { id } = req.params;
      client = await pool.connect();
      const queryCount = `SELECT
                            COUNT(*)
                          FROM
                            public.reg_stationnement_empile
                          WHERE
                            id_reg_stat = $1;`
      const responseCount = await client.query(queryCount, [id])
      let queryDeleteHeader: string;
      let queryDeleteStack: string;
      let responseHeader: any;
      let responseStacked: any;
      queryDeleteHeader = `DELETE FROM 
                              public.entete_reg_stationnement 
                            WHERE
                              id_reg_stat = $1;`
      queryDeleteStack = `DELETE 
                              public.reg_stationnement_empile
                            WHERE
                              id_reg_stat = $1`
      if (Number(responseCount.rows[0].count) === 0) {
        responseHeader = await client.query(queryDeleteHeader, [id]);
        responseStacked = { rowCount: 1 };
      } else {
        responseHeader = await client.query(queryDeleteHeader, [id])
        responseStacked = await client.query(queryDeleteStack, [id])
      }
      const successHeader = responseHeader && responseHeader.rowCount >= 0 ? true : false;
      const successStacked = responseStacked && responseStacked.rowCount >= 0 ? true : false;
      res.json({ success: successHeader && successStacked });
    } catch (err) {
      next(err);
    } finally {
      if (client) {
        client.release();
      }
    }
  }


  const obtiensToutesOperations: RequestHandler = async (_req, res): Promise<void> => {
    console.log('Serveur - Obtention toutes operations')
    let client;
    try {
      client = await pool.connect();
      const query = `
        SELECT *
        FROM public.liste_operations
        order by id_operation
      `;

      const result = await client.query(query);
      res.json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    } finally {
      if (client) {
        client.release(); // Release the connection back to the pool
      }
    }
  };

  const obtiensToutesUnites: RequestHandler = async (_req, res): Promise<void> => {
    console.log('Serveur - Obtention toutes unites')
    let client;
    try {
      client = await pool.connect();
      const query = `
        SELECT *
        FROM public.multiplicateur_facteurs_colonnes
        order by id_unite
      `;

      const result = await client.query(query);
      res.json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    } finally {
      if (client) {
        client.release(); // Release the connection back to the pool
      }
    }
  };

  const nouvelleLigneDefinition: RequestHandler = async (req, res, next): Promise<void> => {
    let client;
    try {
      const { id_reg_stat, ss_ensemble, seuil, oper, cases_fix_min, cases_fix_max, pente_min, pente_max, unite } = req.body;
      client = await pool.connect();
      const query = `INSERT INTO public.reg_stationnement_empile(id_reg_stat,ss_ensemble,seuil,oper,cases_fix_min,cases_fix_max,pente_min,pente_max,unite)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *;`
      const response = await client.query(query, [id_reg_stat, ss_ensemble, seuil, oper, cases_fix_min, cases_fix_max, pente_min, pente_max, unite])
      if (response.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Entry not found' });
        return;
      }
      res.json({ success: true, data: response.rows });
    } catch (err) {
      next(err);
    } finally {
      if (client) {
        client.release();
      }
    }
  }
  const majLigneDefinition: RequestHandler = async (req, res, next): Promise<void> => {
    let client;
    try {
      const { id_reg_stat, ss_ensemble, seuil, oper, cases_fix_min, cases_fix_max, pente_min, pente_max, unite } = req.body;
      const {id} = req.params;
      client = await pool.connect();
      const query = `UPDATE public.reg_stationnement_empile
      SET
        id_reg_stat = $1,
        ss_ensemble = $2,
        seuil = $3,
        oper = $4,
        cases_fix_min = $5,
        cases_fix_max = $6,
        pente_min = $7,
        pente_max = $8,
        unite = $9
      WHERE id_reg_stat_emp = $10 
      RETURNING *;`
      const response = await client.query(query, [id_reg_stat, ss_ensemble, seuil, oper, cases_fix_min, cases_fix_max, pente_min, pente_max, unite, id])
      if (response.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Entry not found' });
        return;
      }
      res.json({ success: true, data: response.rows });
    } catch (err) {
      next(err);
    } finally {
      if (client) {
        client.release();
      }
    }
  }
  const supprimeLigneDefinition: RequestHandler = async (req, res, next): Promise<void> => {
    let client;
    try {
      const { id } = req.params;
      client = await pool.connect();
      
      let queryDeleteStack: string;
      let responseStacked: any;
      queryDeleteStack = `DELETE FROM
                            public.reg_stationnement_empile
                          WHERE
                            id_reg_stat_emp = $1`

      responseStacked = await client.query(queryDeleteStack, [id])
      res.json({ success: responseStacked.rowCount>0 });
    } catch (err) {
      next(err);
    } finally {
      if (client) {
        client.release();
      }
    }
  }
  // Routes
  router.get('/entete', obtiensTousEntetesReglements);
  router.get('/complet/:idToSplit', obtiensReglementCompletParId);
  router.get('/operations', obtiensToutesOperations)
  router.get('/unites', obtiensToutesUnites)
  router.get('/unites/:id', obtiensUnitesParLot)
  router.post('/entete', nouvelEnteteReglement)
  router.delete('/:id', supprimeReglement)
  router.post('/ligne-def', nouvelleLigneDefinition)
  router.put('/ligne-def/:id',majLigneDefinition)
  router.delete('/ligne-def/:id', supprimeLigneDefinition)
  return router;
};