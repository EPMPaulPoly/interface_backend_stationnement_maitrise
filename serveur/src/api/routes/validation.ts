import { condition_strate, RequeteModifStrate, strate, strate_db } from 'database';
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

    const applatissementStrate = (strate_entrante:strate):strate_db|Omit<strate_db,'id_strate'>=>{
        // À Completer
        let output:strate_db|Omit<strate_db,'id_strate'>;
        if (strate_entrante.id_strate!== undefined){
            output ={
                nom_colonne:strate_entrante.nom_colonne,
                nom_table:strate_entrante.nom_table,
                nom_strate:strate_entrante.nom_strate,
                n_sample:strate_entrante.n_sample,
                index_ordre:strate_entrante.index_ordre,
                est_racine:strate_entrante.est_racine,
                ids_enfants:strate_entrante.ids_enfants,
                condition_type: strate_entrante.condition?.condition_type ?? 'equals',
                condition_min: strate_entrante.condition?.condition_type === 'equals' ? null : (strate_entrante.condition?.condition_min ?? null),
                condition_max: strate_entrante.condition?.condition_type === 'equals' ? null : (strate_entrante.condition?.condition_max ?? null),
                condition_valeur: strate_entrante.condition?.condition_type === 'equals' ? Number(strate_entrante.condition!.condition_valeur) : null,
            }
        } else {
            output ={
                id_strate:strate_entrante.id_strate,
                nom_colonne:strate_entrante.nom_colonne,
                nom_table:strate_entrante.nom_table,
                nom_strate:strate_entrante.nom_strate,
                n_sample:strate_entrante.n_sample,
                index_ordre:strate_entrante.index_ordre,
                est_racine:strate_entrante.est_racine,
                ids_enfants:strate_entrante.ids_enfants,
                condition_type: strate_entrante.condition?.condition_type ?? 'equals',
                condition_min: strate_entrante.condition?.condition_type === 'equals' ? null : (strate_entrante.condition?.condition_min ?? null),
                condition_max: strate_entrante.condition?.condition_type === 'equals' ? null : (strate_entrante.condition?.condition_max ?? null),
                condition_valeur: strate_entrante.condition?.condition_type === 'equals' ? Number(strate_entrante.condition!.condition_valeur) : null,
            }
        }
        return output
    }
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
                    ids_enfants,
                    n_sample
                FROM
                    public.strates_echantillonage`;
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ')
            }
            query += ' ORDER BY index_ordre ASC'
            result = await client.query(query)
            const head: number[] = result.rows.filter((row: strate_db) => row.est_racine === true).map((row: strate_db) => row.id_strate);   
            const output = creationStrateCorrecte(head,result.rows)

            res.json({ success: true, data: output });
        } catch (err: any) {
            res.status(500).json({ success: false, error: 'Database error' });
        } finally {
            if (client) {
                client.release()
            }
        }
    };
    const nouvelleStrate: RequestHandler<void> = async(req,res):Promise<void>=>{
        console.log('Création Strates')
        let client;
        try {
            const { princip,id_parent } = req.body;
            client = await pool.connect();
            let query: string;
            let query_parent:string;
            let query_update_parent:string;
            let query_all:string;
            let result: any;
            let result_parent:any;
            let result_update_parent: any;
            let result_all:any;
            const stratePlate = applatissementStrate(princip);
            const {nom_strate,nom_colonne,est_racine,index_ordre,nom_table,condition_type,condition_valeur,condition_min,condition_max,n_sample,ids_enfants} = stratePlate
            if (id_parent === undefined || id_parent === null){
                query = `INSERT INTO public.strates_echantillonage (nom_strate,est_racine,index_ordre,nom_table,nom_colonne,condition_type,condition_min,condition_max,condition_valeur,ids_enfants,n_sample)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`
                result = await client.query(query,[nom_strate,est_racine,index_ordre,nom_table,nom_colonne,condition_type,condition_min,condition_max,condition_valeur,ids_enfants,n_sample])   
            } else{
                query = `INSERT INTO public.strates_echantillonage (nom_strate,est_racine,index_ordre,nom_table,nom_colonne,condition_type,condition_min,condition_max,condition_valeur,ids_enfants,n_sample)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`
                result = await client.query(query,[nom_strate,est_racine,index_ordre,nom_table,nom_colonne,condition_type,condition_min,condition_max,condition_valeur,ids_enfants,n_sample])
                const id_nouveau = result.rows[0].id_strate;
                query_parent = 
                    `SELECT
                        *
                    FROM
                        public.strates_echantillonage
                    WHERE 
                        id_strate = $1
                    `
                result_parent = await client.query(query_parent,[id_parent])
                let strate_parent = result_parent.rows[0]
                let new_strate_parent
                if (strate_parent.ids_enfants=== null){
                    new_strate_parent = {...strate_parent,ids_enfants:[id_nouveau],n_sample:null}
                } else{
                    new_strate_parent = {...strate_parent,n_sample:null}
                    new_strate_parent.ids_enfants.push(id_nouveau)
                }
                query_update_parent = 
                    `UPDATE public.strates_echantillonage
                    SET 
                        ids_enfants = $1,
                        n_sample = $2
                    WHERE id_strate = $3
                    RETURNING *;
                `
                result_update_parent = await client.query(query_update_parent,[new_strate_parent.ids_enfants,new_strate_parent.n_sample,new_strate_parent.id_strate])
                console.log('check insertion')
            }
            query_all = `SELECT 
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
                    ids_enfants,
                    n_sample
                FROM
                    public.strates_echantillonage
                ORDER BY index_ordre ASC`;
            
            result_all = await client.query(query_all)
            const head: number[] = result_all.rows.filter((row: strate_db) => row.est_racine === true).map((row: strate_db) => row.id_strate);   
            const output = creationStrateCorrecte(head,result_all.rows)
            res.json({ success: true, data: output });
        } catch (err: any) {
            res.status(500).json({ success: false, error: 'Database error' });
            
        } finally {
            if (client) {
                client.release()
            }
        }
    }
    const modifieStrate: RequestHandler<RequeteModifStrate> = async(req,res):Promise<void>=>{
        console.log('Modification Strates')
        let client;
        try {
            const {id_strate} = req.params;
            const princip = req.body;
            client = await pool.connect();
            let query: string;
            let query_all:string;
            let result: any;
            let result_all:any;
            const stratePlate = applatissementStrate(princip);
            const {nom_strate,nom_colonne,est_racine,index_ordre,nom_table,condition_type,condition_valeur,condition_min,condition_max,n_sample,ids_enfants} = stratePlate
            query = 
                `UPDATE public.strates_echantillonage
                    SET 
                        nom_strate = $1,
                        nom_colonne = $2,
                        est_racine = $3,
                        index_ordre = $4,
                        nom_table= $5,
                        ids_enfants = $6,
                        n_sample = $7,
                        condition_type = $8,
                        condition_valeur = $9,
                        condition_min = $10,
                        condition_max = $11
                WHERE id_strate = $12
                RETURNING *;
            `
            result = await client.query(query,[nom_strate,nom_colonne,est_racine,index_ordre,nom_table,ids_enfants,n_sample,condition_type,condition_valeur,condition_min,condition_max,id_strate])
            query_all = `SELECT 
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
                    ids_enfants,
                    n_sample
                FROM
                    public.strates_echantillonage
                ORDER BY index_ordre ASC`;
            
            result_all = await client.query(query_all)
            const head: number[] = result_all.rows.filter((row: strate_db) => row.est_racine === true).map((row: strate_db) => row.id_strate);   
            const output = creationStrateCorrecte(head,result_all.rows)
            res.json({ success: true, data: output });
        } catch (err: any) {
            res.status(500).json({ success: false, error: 'Database error' });
        } finally {
            if (client) {
                client.release()
            }
        }
    }
    const supprimeStrateEtEnfants: RequestHandler<RequeteModifStrate>=async(req,res):Promise<void>=>{
        console.log('Suppression strate débutée')
        let client;
        try {
            const {id_strate} = req.params;
            client = await pool.connect();
            let query_child: string;
            let result_child: any;
            let query_all:string;
            let result_all:any
            let query_out:string;
            let result_out:any
            query_child = 
                `SELECT 
                    id_strate,
                    ids_enfants
                FROM
                    public.strates_echantillonage
                WHERE id_strate = $1;
            `
            result_child = await client.query(query_child,[id_strate])
            const data = result_child.rows[0];
            let ids_to_delete:number[]= [Number(id_strate)];

            if (data.ids_enfants !==null){
                for (let id of data.ids_enfants){
                    ids_to_delete.push(Number(id))
                }
            }
            const placeholders = ids_to_delete.map((_, index) => `$${index + 1}`).join(',');
            query_all = `DELETE FROM public.strates_echantillonage
                WHERE id_strate IN (${placeholders});`;
            await client.query(query_all, ids_to_delete);
            query_out = `SELECT 
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
                    ids_enfants,
                    n_sample
                FROM
                    public.strates_echantillonage
                ORDER BY index_ordre ASC`
            result_out = await client.query(query_out)
            const head: number[] = result_out.rows.filter((row: strate_db) => row.est_racine === true).map((row: strate_db) => row.id_strate);   
            const output = creationStrateCorrecte(head,result_out.rows)
            res.json({ success: true, data: output });
        } catch (err: any) {
            res.status(500).json({ success: false, error: 'Database error' });
        } finally {
            if (client) {
                client.release()
            }
        }
    }
    // Routes
    router.get('/strate', obtiensStrates)
    router.post('/strate',nouvelleStrate)
    router.put('/strate/:id_strate',modifieStrate)
    router.delete('/strate/:id_strate',supprimeStrateEtEnfants)
    return router;
};