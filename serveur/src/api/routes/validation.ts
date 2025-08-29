import { condition_strate, strate, strate_db } from 'database';
import { Router, RequestHandler } from 'express';
import { Pool } from 'pg';

export const creationRouteurValidation = (pool: Pool): Router => {
    const router = Router();
    const creationCondition = (ligne:strate_db):condition_strate|undefined=>{
        if (ligne.condition_type==='equals' && ligne.condition_valeur!==null){
            return({
                condition_type:'equals',
                condition_valeur:ligne.condition_valeur
            })
        } else if(ligne.condition_type==='range' ){
            return(
                {
                    condition_type:'range',
                    condition_max:ligne.condition_max,
                    condition_min:ligne.condition_min
                }
            )
        }else {
            return undefined;
        }
    }
    const creationStrateCorrecte = (tete: number[], toutes: strate_db[]): strate[] => {
        let out: strate[] = [];

        // Find all nodes at this level (whose ids are in tete)
        const rel_this_level = toutes.filter((row) => tete.includes(row.id_strate));

        for (let node of rel_this_level) {
            if (!node.ids_enfants || node.ids_enfants.length === 0) {
                // leaf node
                out.push(
                    {
                        ...node,
                        condition:creationCondition(node)
                    }
                );
            } else {
                // has children → recurse
                out.push({
                    ...node,
                    condition:creationCondition(node),
                    subStrata: creationStrateCorrecte(node.ids_enfants, toutes),
                });
            }
        }

        return out;
    };

    const obtiensStrates: RequestHandler<void> = async (req, res): Promise<void> => {
        console.log('obtention strates')
        let client;
        try {
            const { id_strate, n_samples_ge, n_samples_se, colonne_sample } = req.query;
            client = await pool.connect();
            let query: string
            let result: any;
            let conditions: string[] = [];
            if (typeof id_strate !== 'undefined' && id_strate !== 'null') {
                conditions.push(`id_strate=${id_strate}`)
            }
            if (typeof n_samples_ge !== 'undefined' && n_samples_ge !== 'null') {
                conditions.push(`n_samples>=${n_samples_ge}`)
            }
            if (typeof n_samples_se !== 'undefined' && n_samples_se !== 'null') {
                conditions.push(`n_samples<=${n_samples_se}`)
            }
            if (typeof colonne_sample !== 'undefined' && colonne_sample !== 'null') {
                conditions.push(`to_tsvector('french', description) @@ plainto_tsquery('french', ${colonne_sample})`)
            }
            query = `SELECT 
                    id_strate,
                    nom_strate,
                    est_racine,
                    index_ordre,
                    nom_table,
                    nom_colonne,
                    condition_type,
                    condition_min::int,
                    condition_max::int,
                    condition_valeur::int,
                    ids_enfants
                FROM
                    public.strates_echantillonage`;
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ')
            }
            result = await client.query(query)
            const head: number[] = result.rows.filter((row: strate_db) => row.est_racine === true).map((row: strate_db) => row.id_strate);   
            const output = creationStrateCorrecte(head,result.rows)

            res.json({ success: true, data: output });
        } catch (err: any) {
            if (err.message === 'Combinaison invalide de niveau et cubf') {
                res.status(400).json({ success: false, error: 'Combinaison invalide de niveau et cubf' });
            } else {
                res.status(500).json({ success: false, error: 'Database error' });
            }
        } finally {
            if (client) {
                client.release()
            }
        }
    };

    // Routes
    router.get('/strate', obtiensStrates)
    return router;
};