import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
import { DbInventaire,ParamsQuartier,ParamsLot,ParamsInventaire,RequeteInventaire } from '../../types/database';
// Types pour les requêtes
import { Polygon,MultiPolygon } from 'geojson';
import path from 'path';
import {spawn} from 'child_process';
interface GeometryBody {
  geometry: Polygon|MultiPolygon;  
}

export const creationRouteurInventaire = (pool: Pool): Router => {
  const router = Router();
  // Get all lines
  // Get all lines
  const obtiensInventaireParQuartier: RequestHandler<ParamsQuartier> = async (req, res): Promise<void> => {
    console.log('entering get inventory by neighborhood')
    let client;
    try {
      const { id } = req.params;
      client = await pool.connect();
      const query =`SELECT
            c.g_no_lot,
            i.n_places_min,
            i.n_places_max,
            i.n_places_estime,
            i.n_places_mesure,
            i.n_places_max,
            i.id_er,
            i.id_reg_stat,
            i.commentaire,
            i.methode_estime,
            i.cubf,
            i.id_inv
        FROM 
            public.cadastre c
        RIGHT JOIN
            public.inventaire_stationnement i
            ON i.g_no_lot = c.g_no_lot
        WHERE 
            ST_Intersects(c.geometry, 
                (SELECT 
                    geometry
                FROM public.sec_analyse 
                WHERE id_quartier = $1
                LIMIT 1)  -- Limiting to one geometry result
        );`
    const result = await client.query(
        query,
        [id]
      );
      res.json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Database error' });
    } finally{
      if(client){
        client.release()
      }
    }
  };

  const calculInventairePythonQuartier: RequestHandler<ParamsQuartier> = async(req,res): Promise<void> =>{
    console.log('entering calc inventory by neighborhood')
    const {id} = req.params;
    const scriptPath = path.resolve(__dirname, "../../../serveur_calcul_python/calcul_par_quartier.py");

    // Chemin direct vers l'interpréteur Python dans l'environnement Conda
    const pythonExecutable = '/opt/conda/envs/serveur_calcul_python/bin/python3';

    // Exécuter le script Python avec l'interpréteur de l'environnement
    const pythonProcess = spawn(pythonExecutable, [scriptPath, id]);
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
            return res.status(200).json({success:true,data:jsonData});  //  Send JSON response
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

  const calculInventairePythonLot:RequestHandler<ParamsLot> = async(req,res):Promise<void>=>{
    const {id} = req.params;
    const decipheredId = id.replace(/_/g, " ");
    const scriptPath = path.resolve(__dirname, "../../../serveur_calcul_python/calcul_par_lot.py");

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
            return res.status(200).json({success:true,data:jsonData});  //  Send JSON response
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

  const metAJourInventaire:RequestHandler<ParamsInventaire, any, RequeteInventaire> = async (req, res, next) => {
    try {
      const { id_inv } = req.params;
      const { g_no_lot, n_places_min, n_places_max, n_places_estime,n_places_mesure,id_er,id_reg_stat,commentaire,methode_estime } = req.body;
      const client = await pool.connect();
      const result = await client.query<DbInventaire>(
        `UPDATE public.inventaire_stationnement SET 
            g_no_lot = $1, 
            n_places_min = $2, 
            n_places_max = $3, 
            n_places_estime = $4,
            n_places_mesure = $5,
            id_er = $6,
            id_reg_stat = $7,
            commentaire = $8,
            methode_estime= $9
          WHERE 
            id_inv = $10 
          RETURNING 
            *`,
        [g_no_lot, n_places_min, n_places_max, n_places_estime, n_places_mesure,id_er,id_reg_stat,commentaire,methode_estime,id_inv]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Entry not found' });
        return;
      }
      res.json({ success: true, data: result.rows[0] });
      client.release();
    } catch (err) {
      next(err);
    }
  };
  const nouvelInventaire:RequestHandler<any, any, RequeteInventaire> = async (req, res, next) => {
    try {
      const { g_no_lot, n_places_min, n_places_max, n_places_estime,n_places_mesure,id_er,id_reg_stat,commentaire,methode_estime } = req.body;
      const client = await pool.connect();
      const result = await client.query<DbInventaire>(
        `INSERT INTO public.inventaire_stationnement(g_no_lot,n_places_min,n_places_max,n_places_estime,n_places_mesure,id_er,id_reg_stat,commentaire,methode_estime)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)RETURNING *`,
        [g_no_lot, n_places_min, n_places_max, n_places_estime, n_places_mesure,id_er,id_reg_stat,commentaire,methode_estime]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Entry not found' });
        return;
      }
      res.json({ success: true, data: result.rows[0] });
      client.release();
    } catch (err) {
      next(err);
    }
  }


  // Routes
  router.get('/quartier/:id', obtiensInventaireParQuartier);
  router.get('/calcul/quartier/:id',calculInventairePythonQuartier);
  router.get('/calcul/lot/:id',calculInventairePythonLot); 
  router.post('/:id_inv',metAJourInventaire)
  router.put('/',nouvelInventaire)
  return router;
};