import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
import { DbTerritoire, ParamsCadastre, ParamsPeriode, DbRole, DbCadastre, ParamsQuartier, DbCadastreGeomIdOnly, ParamsTerritoire } from '../../types/database';
import path from 'path';
import { spawn } from 'child_process';
// Types pour les requêtes
import { Polygon, MultiPolygon } from 'geojson';
interface GeometryBody {
    geometry: Polygon | MultiPolygon;
}

export const creationRouteurProfileAccumVehiculeQuartier = (pool: Pool): Router => {
    const router = Router();
    const obtientPAVQuartier: RequestHandler<ParamsTerritoire> = async (req, res): Promise<void> => {
        let client;
        try {
            const { order, id_quartier } = req.query;
            const numbers: number[] = (typeof order === 'string' ? order.split(',').map(Number) : []);
            const selectedIds = numbers.slice(0, 3);
            const stringForReq = selectedIds.map(String).join('');
            console.log('Obtention Profile Accumulation vehicule');
            client = await pool.connect();
            const query_total = `
                SELECT 
                    id_quartier,
                    nom_quartier,
                    inv_${stringForReq} AS valeur
                FROM public.stat_agrege 
                WHERE id_quartier = $1
                ORDER BY id_quartier;
            `;

            const result = await client.query(query_total, [id_quartier]);
            const query_PAV = `
            SELECT * 
            FROM public.profile_accumulation_vehicule
            WHERE id_quartier = $1
            ORDER BY heure ASC
        `
            const result_PAV = await client.query(query_PAV, [id_quartier])
            const row = result.rows[0];
            const output = {
                id_quartier: result.rows[0]?.id_quartier ?? 0,
                nom_quartier: result.rows[0]?.nom_quartier ?? '',
                capacite_stat_quartier: result.rows[0]?.valeur ?? 0,
                PAV: result_PAV.rows.map(row => ({
                    id_ent_pav: row.id_ent_pav ?? 0,
                    heure: row.heure ?? 0,
                    voitures: row.voitures ?? 0
                }))
            };
            res.json({ success: true, data: output });
        } catch (err) {
            res.status(500).json({ success: false, error: 'Database error' });
            console.log('fourré dans la fonction obtention')
        } finally {
            if (client) {
                client.release()
            }
        }
    };
    const calculPAV: RequestHandler<ParamsQuartier> = async (req, res): Promise<void> => {
        console.log('calcul du profile accumulation vehicule')
        const { id } = req.params;
        const scriptPath = path.resolve(__dirname, "../../../serveur_calcul_python/calcul_profils_acc_veh.py");

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
    const MAJPAV: RequestHandler<ParamsQuartier> = async (req, res,next): Promise<void> => {
        const client = await pool.connect();
        try {
            const data = req.body;
            const {id} = req.params
            if (!Array.isArray(data) || data.length === 0) {
                res.status(400).json({ success: false, error: 'Invalid or empty data' });
                throw new Error('empty array provided')
            }

            await client.query('BEGIN');

            // Prepare the values for bulk insert and update
            const values = data.map(item =>
                `(${item.heure},${id}, ${item.voitures})`
            ).join(', ');

            // Insert new items or update existing ones
            const insertQuery = `
                DELETE FROM public.profile_accumulation_vehicule WHERE id_quartier = ${id};
                INSERT INTO public.profile_accumulation_vehicule (heure, id_quartier, voitures)
                VALUES ${values}
                ON CONFLICT (id_quartier, heure) DO NOTHING
                RETURNING *;
            `;

            const result = await client.query(insertQuery);
            await client.query('COMMIT');

            res.json({ success: true, data: result.rows });
        } catch (err) {
            next(err);
        } finally {
            if (client) {
                client.release();
            }
        }
    }

    // Routes
    router.get('', obtientPAVQuartier)
    router.get('/recalcule/:id', calculPAV)
    router.post('/:id',MAJPAV)
    return router;
};