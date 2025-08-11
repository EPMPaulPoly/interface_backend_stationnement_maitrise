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
                // Extract JSON by finding the first `{` (start of JSON)
                const jsonStartIndex = outputData.indexOf('[');
                if (jsonStartIndex !== -1) {
                    const jsonString = outputData.slice(jsonStartIndex).trim();
                    const jsonData = JSON.parse(jsonString);
                    if (jsonData[0]===true){
                        //console.log('Parsed JSON:', jsonData);
                        return res.status(200).json({success:true});  //  Send JSON response
                    }else{
                        console.error('No JSON found in output:', outputData);
                        return res.status(500).send('Erreur: Erreur dans le script python.'); 
                    }
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

    const obtiensAnalyseVariabilite:RequestHandler<RequeteAnalyseVariabilite> = async(req,res,next):Promise<void>=>{
        
        console.log('obtention nombre utilisation du sol par niveau')
        let client;
        try {
            client = await pool.connect();
            const {id_er,cubf_n1}=req.query;
            const id_out: number[] = (typeof id_er === 'string' ? id_er.split(',').map(Number) : []);
            const cubf_out: number[] = (typeof cubf_n1 ==='string' ? cubf_n1.split(',').map(Number):[]);
            let query: string
            let result: any;
            let conditions: string[]=[];
            if (id_out.length>0){
                conditions.push(`id_er IN (${id_out.join(',')})`)
            }
            if (cubf_out.length>0){
                conditions.push(`land_use IN (${cubf_out.join(',')})`)
            }
            if(conditions.length>0){
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
                    av.n_lots,
                    av.land_use,
                    rsd.description_er
                FROM 
                    analyse_variabilite av
                LEFT JOIN
                    reg_set_defs rsd ON rsd.id_er=av.id_er
            `
            }else{
                query=`
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
                    av.n_lots,
                    av.land_use,
                    rsd.description_er
                FROM 
                    analyse_variabilite av
                LEFT JOIN
                    reg_set_defs rsd ON rsd.id_er=av.id_er
                `
                query += 'WHERE ' + conditions.join(' AND ');
            }
            
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
    router.get('/obtiens-donnees-varia',obtiensAnalyseVariabilite)
    return router;
};