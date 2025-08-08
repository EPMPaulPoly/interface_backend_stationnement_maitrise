import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
// Types pour les requêtes
import { Polygon,MultiPolygon } from 'geojson';
import path from 'path';
import { dataHistogrammeVariabilite, RequeteAnalyseVariabilite } from 'database';
import { spawn } from 'child_process';

export const creationRouteurAnalyseVariabilite = (pool:Pool):Router =>{

    const router = Router();


    const calculeAnalyseVariabilite:RequestHandler =  async(req,res,next):Promise<void>=>{
        const scriptPath = path.resolve(__dirname, "../../../../serveur_calcul_python/calcul_variabilite_secteurs_facteurs.py");

        // Chemin direct vers l'interpréteur Python dans l'environnement Conda
        const pythonExecutable = '/opt/conda/envs/serveur_calcul_python/bin/python3';

        // Exécuter le script Python avec l'interpréteur de l'environnement
        const pythonProcess = spawn(pythonExecutable, [scriptPath]);

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

    const obtiensAnalyseVariabilite:RequestHandler = async(req,res,next):Promise<void>=>{
        
        console.log('obtention nombre utilisation du sol par niveau')
        let client;
        try {
            client = await pool.connect();
            const {ids}=req.params;
            const id_out = ids.split(',')
            let query: string
            let result: any;
            query = `
                WITH reg_set_defs AS (
                    SELECT
                        id_er,
                        description_er
                    FROM 
                        ensembles_reglements_stat
                )
                SELECT
                    av.cubf,
                    av.n_places_min,
                    av.id_er,
                    rsd.description_er
                FROM 
                    analyse_variabilite av
                LEFT JOIN
                    reg_set_defs rsd ON rsd.id_er=av.id_er
            `
            result = await client.query(query)
            res.json({ success: true, data: result.rows });
        } catch (err) {
            res.status(500).json({ success: false, error: 'Database error' });
        } finally {
            if (client) {
                client.release()
            }
        }
    }
    router.get('/recalcule-inventaires-tous-ens-regs',calculeAnalyseVariabilite)
    router.get('/obtiens-donnees-varia/:ids')
    return router;
};