import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';
// Types pour les requêtes
import { Polygon, MultiPolygon } from 'geojson';
import path from 'path';
import { dataBoxPlotVariabilite, dataHistogrammeVariabilite, RequeteAnalyseFacteurEchelle, RequeteAnalyseVariabilite, RequeteHistoVariabilite, RetourBDAnalyseVariabilite } from 'database';
import { spawn } from 'child_process';
import {bin,Bin} from 'd3-array';

export const creationRouteurAnalyseVariabilite = (pool: Pool): Router => {

    const router = Router();


    const calculeAnalyseVariabilite: RequestHandler = async (req, res, next): Promise<void> => {
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
                        if (jsonData[0] === true) {
                            //console.log('Parsed JSON:', jsonData);
                            return res.status(200).json({ success: true });  //  Send JSON response
                        } else {
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

    const obtiensAnalyseVariabilite: RequestHandler<RequeteAnalyseVariabilite> = async (req, res, next): Promise<void> => {

        console.log('Obtention données analyse variabilité')
        let client;
        try {
            client = await pool.connect();
            const { id_er, cubf_n1, id_ref,voir_inv,echelle } = req.query;
            const id_out: number[] = (typeof id_er === 'string' ? id_er.split(',').map(Number) : []);
            const cubf_out: number = (typeof cubf_n1 === 'string' ? Number(cubf_n1) : -1);
            const id_ref_out: number = (typeof id_ref === 'string' ? Number(id_ref) : -1);
            const voir_inv_fin:boolean =(typeof voir_inv ==='string' ?voir_inv.toLowerCase() === 'true' :false);
            const echelle_fin: number = (typeof echelle === 'string' ? Number(echelle) : 1);
            let query: string;
            let result: any;
            let conditions: string[] = [];
            if (id_out.length > 0) {
                conditions.push(`av.id_er IN (${id_out.join(',')})`)
            }
            if (cubf_out !== -1) {
                conditions.push(`av.land_use =  ${cubf_out}`)
            }
            conditions.push(`av.facteur_echelle = ${echelle_fin}`)
            let pre_query:string = '';
            // Création des CTE et de l'inventaire tel qu'implémenté
            if (voir_inv_fin){
                if (id_ref_out === -1){
                    pre_query = `
                        WITH land_use_desc AS(
                            SELECT
                                cubf::int as land_use,
                                description as land_use_desc
                            FROM
                                cubf
                        ),reg_set_defs AS (
                            SELECT
                                id_er,
                                description_er
                            FROM 
                                ensembles_reglements_stat
                        )
                        SELECT
                            inv.land_use,
                            inv.n_places_min as valeur,
                            -5::int as id_er,
                            'Inventaire Actuel' as description_er,
                            inv.n_lots::int,
                            lud.land_use_desc,
                            1 as facteur_echelle
                        FROM 
                            inv_reg_aggreg_cubf_n1 inv
                        LEFT JOIN land_use_desc lud ON lud.land_use = inv.land_use
                        `
                    if (cubf_out !== -1){
                        pre_query+= ` WHERE inv.land_use = ${cubf_out} `
                    }
                    pre_query +=" UNION ALL"
                } else{
                    pre_query = `
                        WITH land_use_desc AS(
                            SELECT
                                cubf::int as land_use,
                                description as land_use_desc
                            FROM
                                cubf
                        ),base_data AS(
                            SELECT
                                id_er,
                                land_use,
                                n_places_min as n_places_ref
                            FROM 
                                variabilite 
                            WHERE id_er = ${id_ref_out}
                        ),reg_set_defs AS (
                            SELECT
                                id_er,
                                description_er
                            FROM 
                                ensembles_reglements_stat
                        )
                        SELECT
                            inv.land_use::int,
                            COALESCE(inv.n_places_min / NULLIF(bd.n_places_ref, 0) *100, 0) as valeur,
                            -5::int as id_er,
                            'Inventaire Actuel' as description_er,
                            inv.n_lots::int,
                            lud.land_use_desc,
                            1 as facteur_echelle
                        FROM 
                            inv_reg_aggreg_cubf_n1 inv
                        LEFT JOIN land_use_desc lud ON lud.land_use = inv.land_use
                        LEFT JOIN base_data bd ON bd.land_use = inv.land_use
                        `
                    if (cubf_out !== -1){
                        pre_query+= ` WHERE inv.land_use = ${cubf_out} `
                    }
                    pre_query +=" UNION ALL"
                }
            } else{
                if (id_ref_out === -1){
                        pre_query = `
                            WITH land_use_desc AS(
                                SELECT
                                    cubf::int as land_use,
                                    description as land_use_desc
                                FROM
                                    cubf
                            ),reg_set_defs AS (
                                SELECT
                                    id_er,
                                    description_er
                                FROM 
                                    ensembles_reglements_stat
                            )
                            `
                    } else{
                        pre_query = `
                            WITH land_use_desc AS(
                                SELECT
                                    cubf::int as land_use,
                                    description as land_use_desc
                                FROM
                                    cubf
                            ),base_data AS(
                                SELECT
                                    id_er,
                                    land_use,
                                    n_places_min as n_places_ref
                                FROM 
                                    variabilite 
                                WHERE id_er = ${id_ref_out}
                            ),reg_set_defs AS (
                                SELECT
                                    id_er,
                                    description_er
                                FROM 
                                    ensembles_reglements_stat
                            )
                            `
                    }
            }
            // Aller chercher les calculs d'inventaire en appliquant un règlement à l'ensemble des données foncières
            if (conditions.length > 0) {
                
                if (id_ref_out === -1) {
                    query = `
                    
                    SELECT
                        av.land_use,
                        av.n_places_min as valeur,
                        av.id_er::int,
                        rsd.description_er,
                        av.n_lots,
                        lud.land_use_desc,
                        av.facteur_echelle
                    FROM 
                        variabilite av
                    LEFT JOIN
                        reg_set_defs rsd ON rsd.id_er=av.id_er
                    LEFT JOIN land_use_desc lud ON lud.land_use = av.land_use 
                    `
                    query = pre_query + query + 'WHERE ' + conditions.join(' AND ') + ' ORDER BY valeur ASC';
                } else {
                    query = `
                    SELECT
                        av.land_use,
                        COALESCE(av.n_places_min / NULLIF(bd.n_places_ref, 0) *100, 0) as valeur,
                        av.id_er::int,
                        rsd.description_er,
                        av.n_lots,
                        lud.land_use_desc,
                        av.facteur_echelle
                    FROM 
                        variabilite av
                    LEFT JOIN
                        reg_set_defs rsd ON rsd.id_er=av.id_er
                    LEFT JOIN
                        base_data bd ON bd.land_use = av.land_use
                    LEFT JOIN land_use_desc lud ON lud.land_use = av.land_use 
                    `
                    query = pre_query + query + 'WHERE ' + conditions.join(' AND ') + 'AND av.facteur_echelle = 1 ORDER BY valeur ASC';
                }
            } else {
                if (id_ref_out === -1) {
                    query = pre_query +`
                    SELECT
                        av.land_use,
                        av.n_places_min as valeur,
                        av.id_er::int,
                        rsd.description_er,
                        av.n_lots,
                        lud.land_use_desc
                    FROM 
                        variabilite av
                    LEFT JOIN
                        reg_set_defs rsd ON rsd.id_er=av.id_er
                    LEFT JOIN land_use_desc lud ON lud.land_use = av.land_use 
                    WHERE av.facteur_echelle = 1 
                    ORDER BY valeur ASC
                    `

                } else {
                    query = pre_query + `
                    SELECT
                        av.land_use,
                        COALESCE(av.n_places_min / NULLIF(bd.n_places_ref, 0) *100, 0) as valeur,
                        av.id_er::int,
                        rsd.description_er,
                        av.n_lots,
                        lud.land_use_desc
                    FROM 
                        variabilite av
                    LEFT JOIN
                        reg_set_defs rsd ON rsd.id_er=av.id_er
                    LEFT JOIN land_use_desc lud ON lud.land_use = av.land_use 
                    WHERE av.facteur_echelle = 1 
                    ORDER BY valeur ASC
                    `
                }
            }

            result = await client.query(query)
            const donnees: RetourBDAnalyseVariabilite[] = result.rows;
            let formatted_output: dataHistogrammeVariabilite;
            if (id_out.length > 0) {
                const land_uses = Array.from(new Set(donnees.map((row) => row.land_use)));
                if (voir_inv_fin){
                    id_out.unshift(-5)
                }
                formatted_output = {
                    labels: id_out.map((id) => { return donnees.find((row) => row.id_er === id)?.description_er ?? 'N/A' }),
                    datasets: land_uses.map((lu) => {
                        const lu_filter_data = donnees.filter((row) => row.land_use === lu);
                        return {
                            label: lu_filter_data[0]?.land_use_desc ?? 'N/A',
                            data: id_out.map((id) => lu_filter_data.find((row) => row.id_er === id)?.valeur ?? 0),
                            cubf: lu_filter_data[0]?.land_use ?? -1,
                        };
                    })
                }
            } else {
                const land_uses = Array.from(new Set(donnees.map((row) => row.land_use)));
                const rulesets = Array.from(new Set(donnees.map((row)=>row.id_er)));
                if (voir_inv_fin){
                    rulesets.unshift(-5)
                }
                formatted_output = {
                    labels: rulesets.map((id) => { return donnees.find((row) => row.id_er === id)?.description_er ?? 'N/A' }),
                    datasets: land_uses.map((lu) => {
                        const lu_filter_data = donnees.filter((row) => row.land_use === lu);
                        return {
                            label: lu_filter_data[0]?.land_use_desc ?? 'N/A',
                            data: rulesets.map((id) => {
                                return lu_filter_data.find((row) => row.id_er === id)?.valeur ?? 0}),
                            cubf: lu_filter_data[0]?.land_use ?? -1,
                        }
                    })
                }
            }
            res.json({ success: true, data: formatted_output });
        } catch (err) {
            res.status(500).json({ success: false, error: 'Database error' });
        } finally {
            if (client) {
                client.release()
            }
        }
    }

    const obtiensHistoVariabilite: RequestHandler<RequeteHistoVariabilite> = async(req,res,next):Promise<void>=>{
        console.log('Obtention histo variabilité')
        let client;
        try {
            client = await pool.connect();
            const { id_er, cubf_n1, voir_inv,echelle } = req.query;
            const id_out: number[] = (typeof id_er === 'string' ? id_er.split(',').map(Number) : []);
            const cubf_out: number = (typeof cubf_n1 === 'string' ? Number(cubf_n1) : -1);
            const voir_inv_fin:boolean =(typeof voir_inv ==='string' ?voir_inv.toLowerCase() === 'true' :false);
            const echelle_fin:number=(typeof echelle ==='string'?Number(echelle):1);
            let query: string;
            let result: any;
            let inv_result:any;
            let conditions: string[] = [];
            if (id_out.length > 0) {
                conditions.push(`av.id_er IN (${id_out.join(',')})`)
            }
            if (cubf_out !== -1) {
                conditions.push(`av.land_use =  ${cubf_out}`)
            }
            conditions.push(`facteur_echelle = ${echelle_fin}`)
            let pre_query:string = '';
            let inv_query:string = '';
            if (voir_inv_fin){
                inv_query = `
                    WITH land_use_desc AS(
                        SELECT
                            cubf::int as land_use,
                            description as land_use_desc
                        FROM
                            cubf
                    )
                    SELECT
                        inv.land_use,
                        inv.n_places_min as valeur,
                        -5::int as id_er,
                        'Inventaire Actuel' as description_er,
                        inv.n_lots::int,
                        lud.land_use_desc
                    FROM 
                        inv_reg_aggreg_cubf_n1 inv
                    LEFT JOIN land_use_desc lud ON lud.land_use = inv.land_use
                `
                if (cubf_out !== -1){
                    inv_query+= ` WHERE inv.land_use = ${cubf_out} `
                }
            }
            pre_query = `
                    WITH land_use_desc AS(
                        SELECT
                            cubf::int as land_use,
                            description as land_use_desc
                        FROM
                            cubf
                    ),reg_set_defs AS (
                        SELECT
                            id_er,
                            description_er
                        FROM 
                            ensembles_reglements_stat
                    )
                    `
            if (id_out.length > 0 && cubf_out !== -1) {
                query = `
                SELECT
                    av.land_use,
                    av.n_places_min as valeur,
                    av.id_er::int,
                    rsd.description_er,
                    av.n_lots,
                    lud.land_use_desc
                FROM 
                    variabilite av
                LEFT JOIN
                    reg_set_defs rsd ON rsd.id_er=av.id_er
                LEFT JOIN land_use_desc lud ON lud.land_use = av.land_use 
                `
                query = pre_query + query + 'WHERE ' + `av.id_er IN (${id_out.join(',')}) AND av.land_use = ${cubf_out} AND av.facteur_echelle = ${echelle_fin}`;
            } else if (id_out.length > 0){
                query = `
                SELECT
                    SUM(av.n_places_min) as valeur,
                    av.id_er::int,
                    rsd.description_er,
                    'Tous' as land_use_desc
                FROM 
                    variabilite av
                LEFT JOIN
                    reg_set_defs rsd ON rsd.id_er=av.id_er
                LEFT JOIN land_use_desc lud ON lud.land_use = av.land_use 
                
                `
                query = pre_query + query + 'WHERE ' + `av.id_er IN (${id_out.join(',')}) AND av.facteur_echelle = ${echelle_fin} GROUP BY av.id_er,rsd.description_er `;
            }else {
                query = pre_query+`
                SELECT
                    SUM(av.n_places_min) as valeur,
                    av.id_er::int,
                    rsd.description_er,
                    'Tous' as land_use_desc
                FROM 
                    variabilite av
                LEFT JOIN
                    reg_set_defs rsd ON rsd.id_er=av.id_er
                LEFT JOIN land_use_desc lud ON lud.land_use = av.land_use 
                WHERE av.facteur_echelle = ${echelle_fin}
                GROUP BY av.id_er,rsd.description_er
                `
            }
            if (voir_inv_fin){
                [result,inv_result] = await Promise.all([ client.query(query), client.query(inv_query)])
            }else {
                result = await client.query(query)
            }
            const donnees: RetourBDAnalyseVariabilite[] = result.rows;
            
            const allValues = donnees.flatMap((r)=>r.valeur)
            const minVal = Math.min(...allValues);
            const maxVal = Math.max(...allValues);
            const nValues = allValues.length
            const binner = bin<number,number>().domain([minVal,maxVal]).thresholds(10);
            const sampleBins = binner(allValues);
            const binLabels = sampleBins.map((b:Bin<number, number>) => `${b.x0?.toFixed(0)} - ${b.x1?.toFixed(0)}`);
            const dataOut = sampleBins.map((b:Bin<number, number>) => b.length/nValues)
            let formatted_output: dataHistogrammeVariabilite;
            if (id_out.length > 0) {
                const land_uses = Array.from(new Set(donnees.map((row) => row.land_use)));
                if (voir_inv_fin){
                    id_out.unshift(-5)
                }
                formatted_output = {
                    labels: binLabels,
                    datasets: land_uses.map((lu) => {
                        const lu_filter_data = donnees.filter((row) => row.land_use === lu);
                        return {
                            label: lu_filter_data[0]?.land_use_desc ?? 'N/A',
                            data: dataOut
                        };
                    })
                }
            } else {
                const land_uses = Array.from(new Set(donnees.map((row) => row.land_use)));
                const rulesets = Array.from(new Set(donnees.map((row)=>row.id_er)));
                if (voir_inv_fin){
                    rulesets.unshift(-5)
                }
                formatted_output = {
                    labels: rulesets.map((id) => { return donnees.find((row) => row.id_er === id)?.description_er ?? 'N/A' }),
                    datasets: land_uses.map((lu) => {
                        const lu_filter_data = donnees.filter((row) => row.land_use === lu);
                        return {
                            label: lu_filter_data[0]?.land_use_desc ?? 'N/A',
                            data: rulesets.map((id) => {
                                return lu_filter_data.find((row) => row.id_er === id)?.valeur ?? 0}),
                            cubf: lu_filter_data[0]?.land_use ?? -1,
                        }
                    })
                }
            }
            res.json({ success: true, data: formatted_output });
        } catch (err) {
            res.status(500).json({ success: false, error: 'Database error' });
        } finally {
            if (client) {
                client.release()
            }
        }
    }

    const obtiensBoxPlot:RequestHandler<RequeteAnalyseFacteurEchelle> = async(req,res,next):Promise<void>=>{
        console.log('Obtention Box Plot ')
        let client;
        try {
            client = await pool.connect();
            const { id_er, cubf_n1} = req.query;
            const id_out: number[] = (typeof id_er === 'string' ? id_er.split(',').map(Number) : []);
            const cubf_out: number = (typeof cubf_n1 === 'string' ? Number(cubf_n1) : -1);
            let query: string;
            let result: any;
            let conditions: string[] = [];
            if (id_out.length > 0) {
                conditions.push(`av.id_er IN (${id_out.join(',')})`)
            }
            if (cubf_out !== -1) {
                conditions.push(`av.land_use =  ${cubf_out}`)
            }
            let pre_query:string = '';
            pre_query = `
                    WITH land_use_desc AS(
                        SELECT
                            cubf::int as land_use,
                            description as land_use_desc
                        FROM
                            cubf
                    ),reg_set_defs AS (
                        SELECT
                            id_er,
                            description_er
                        FROM 
                            ensembles_reglements_stat
                    )
                    `
            if (id_out.length > 0 && cubf_out !== -1) {
                query = `
                SELECT
                    av.land_use,
                    av.n_places_min as valeur,
                    av.id_er::int,
                    rsd.description_er,
                    av.n_lots,
                    lud.land_use_desc,
                    av.facteur_echelle
                FROM 
                    variabilite av
                LEFT JOIN
                    reg_set_defs rsd ON rsd.id_er=av.id_er
                LEFT JOIN land_use_desc lud ON lud.land_use = av.land_use 
                `
                query = pre_query + query + 'WHERE ' + `av.id_er IN (${id_out.join(',')}) AND av.land_use = ${cubf_out} ORDER BY av.facteur_echelle,av.id_er ASC`;
            } else if (id_out.length > 0){
                query = `
                SELECT
                    SUM(av.n_places_min) as valeur,
                    av.id_er::int,
                    rsd.description_er,
                    'Tous' as land_use_desc,
                    av.facteur_echelle
                FROM 
                    variabilite av
                LEFT JOIN
                    reg_set_defs rsd ON rsd.id_er=av.id_er
                LEFT JOIN land_use_desc lud ON lud.land_use = av.land_use 
                
                `
                query = pre_query + query + 'WHERE ' + `av.id_er IN (${id_out.join(',')}) GROUP BY av.id_er,rsd.description_er,av.facteur_echelle ORDER BY av.facteur_echelle,av.id_er ASC`;
            }else {
                query = pre_query+`
                SELECT
                    SUM(av.n_places_min) as valeur,
                    av.id_er::int,
                    rsd.description_er,
                    'Tous' as land_use_desc,
                    av.facteur_echelle
                FROM 
                    variabilite av
                LEFT JOIN
                    reg_set_defs rsd ON rsd.id_er=av.id_er
                LEFT JOIN land_use_desc lud ON lud.land_use = av.land_use 
                GROUP BY av.id_er,rsd.description_er,av.facteur_echelle
                ORDER BY av.facteur_echelle,av.id_er ASC
                `
            }
            
            result = await client.query(query)
            
            const donnees: RetourBDAnalyseVariabilite[] = result.rows;
            let formatted_output: dataBoxPlotVariabilite;
            if (id_out.length > 0) {
                const scales = Array.from(new Set(donnees.map((row)=>row.facteur_echelle)));
                formatted_output = {
                    labels: scales.map((s) => String(donnees.find((row) => row.facteur_echelle === s)?.facteur_echelle ?? '1' )),
                    // Convert each dataset's data to an array of arrays for boxplot
                    datasets: [{
                        label:'rando',
                        data:scales.map((s) => {
                        const scale_filter_data = donnees.filter((row) => row.facteur_echelle === s);
                        const out = id_out.map((id) => scale_filter_data.find((row) => row.id_er === id)?.valeur ?? 0);
                        // For each id, wrap the value in an array to match number[][]
                        return out;})
                    }]                    
                }
            } else {
                const rulesets = Array.from(new Set(donnees.map((row)=>row.id_er)));
                const scales = Array.from(new Set(donnees.map((row)=>row.id_er)));
                formatted_output = {
                    labels: scales.map((s) => String(donnees.find((row) => row.facteur_echelle === s)?.facteur_echelle ?? '1' )),
                    // Convert each dataset's data to an array of arrays for boxplot
                    datasets: [{
                        label:'rando',
                        data:scales.map((s) => {
                        const scale_filter_data = donnees.filter((row) => row.facteur_echelle === s);
                        const out = rulesets.map((id) => scale_filter_data.find((row) => row.id_er === id)?.valeur ?? 0);
                        // For each id, wrap the value in an array to match number[][]
                        return out;})
                    }]                  
                }
            }
            res.json({ success: true, data: formatted_output });
        } catch (err) {
            res.status(500).json({ success: false, error: 'Database error' });
        } finally {
            if (client) {
                client.release()
            }
        }
    }

    const obtiensBoxPlotParUsage: RequestHandler<RequeteAnalyseVariabilite> = async(req,res,next):Promise<void> =>{
        console.log('Obtention box plot')
        let client:any;
        try {
            client = await pool.connect();
            const { id_er, cubf_n1} = req.query;
            const id_out: number[] = (typeof id_er === 'string' ? id_er.split(',').map(Number) : []);
            const cubf_out: number = (typeof cubf_n1 === 'string' ? Number(cubf_n1) : -1);
            let query: string;
            let result: any;
            let conditions: string[] = [];
            if (id_out.length > 0) {
                conditions.push(`av.id_er IN (${id_out.join(',')})`)
            }
            if (cubf_out !== -1) {
                conditions.push(`av.land_use =  ${cubf_out}`)
            }
            let pre_query:string = '';
            pre_query = `
                    WITH land_use_desc AS(
                        SELECT
                            cubf::int as land_use,
                            description as land_use_desc
                        FROM
                            cubf
                    ),reg_set_defs AS (
                        SELECT
                            id_er,
                            description_er
                        FROM 
                            ensembles_reglements_stat
                    )
                    `
            if (id_out.length > 0 && cubf_out !== -1) {
                query = `
                SELECT
                    av.land_use,
                    av.n_places_min as valeur,
                    av.id_er::int,
                    rsd.description_er,
                    av.n_lots,
                    lud.land_use_desc,
                    av.facteur_echelle
                FROM 
                    variabilite av
                LEFT JOIN
                    reg_set_defs rsd ON rsd.id_er=av.id_er
                LEFT JOIN land_use_desc lud ON lud.land_use = av.land_use 
                `
                query = pre_query + query + 'WHERE ' + `av.id_er IN (${id_out.join(',')}) AND av.land_use = ${cubf_out} AND av.facteur_echelle=1 ORDER BY av.facteur_echelle,av.id_er ASC`;
            } else if (id_out.length > 0){
                query = `
                SELECT
                    SUM(av.n_places_min) as valeur,
                    av.id_er::int,
                    rsd.description_er,
                    'Tous' as land_use_desc,
                    av.facteur_echelle
                FROM 
                    variabilite av
                LEFT JOIN
                    reg_set_defs rsd ON rsd.id_er=av.id_er
                LEFT JOIN land_use_desc lud ON lud.land_use = av.land_use 
                
                `
                query = pre_query + query + 'WHERE ' + `av.id_er IN (${id_out.join(',')}) AND av.facteur_echelle=1 GROUP BY av.id_er,rsd.description_er,av.facteur_echelle 
                 ORDER BY av.facteur_echelle,av.id_er ASC`;
            }else {
                query = pre_query+`
                SELECT
                    SUM(av.n_places_min) as valeur,
                    av.id_er::int,
                    rsd.description_er,
                    'Tous' as land_use_desc,
                    av.facteur_echelle
                FROM 
                    variabilite av
                LEFT JOIN
                    reg_set_defs rsd ON rsd.id_er=av.id_er
                LEFT JOIN land_use_desc lud ON lud.land_use = av.land_use 
                WHERE av.facteur_echelle = 1
                GROUP BY av.id_er,rsd.description_er,av.facteur_echelle
                ORDER BY av.facteur_echelle,av.id_er ASC
                `
            }
            
            result = await client.query(query)
            
            const donnees: RetourBDAnalyseVariabilite[] = result.rows;
            let formatted_output: dataBoxPlotVariabilite;
            if (id_out.length > 0) {
                const scales = Array.from(new Set(donnees.map((row)=>row.facteur_echelle)));
                formatted_output = {
                    labels: ['Estimé'],
                    // Convert each dataset's data to an array of arrays for boxplot
                    datasets: [{
                        label:'Toutes entrées valides - ER Sélectionés',
                        data:scales.map((s) => {
                        const scale_filter_data = donnees.filter((row) => row.facteur_echelle === s);
                        const out = id_out.map((id) => scale_filter_data.find((row) => row.id_er === id)?.valeur ?? 0);
                        // For each id, wrap the value in an array to match number[][]
                        return out;})
                    }]                    
                }
            } else {
                const rulesets = Array.from(new Set(donnees.map((row)=>row.id_er)));
                const scales = Array.from(new Set(donnees.map((row)=>row.id_er)));
                formatted_output = {
                    labels: ['Estimé'],
                    // Convert each dataset's data to an array of arrays for boxplot
                    datasets: [{
                        label:'Toutes entrées valides - ER Sélectionés',
                        data:scales.map((s) => {
                        const scale_filter_data = donnees.filter((row) => row.facteur_echelle === s);
                        const out = rulesets.map((id) => scale_filter_data.find((row) => row.id_er === id)?.valeur ?? 0);
                        // For each id, wrap the value in an array to match number[][]
                        return out;})
                    }]                  
                }
            }
            res.json({ success: true, data: formatted_output });
        } catch (err) {
            res.status(500).json({ success: false, error: 'Database error' });
        } finally {
            if (client) {
                client.release()
            }
        }
    }
    router.get('/recalcule-inventaires-tous-ens-regs', calculeAnalyseVariabilite)
    router.get('/obtiens-donnees-varia', obtiensAnalyseVariabilite)
    router.get('/histo-varia',obtiensHistoVariabilite)
    router.get('/boxplot-facteurs',obtiensBoxPlot)
    router.get('/boxplot-par-usage',obtiensBoxPlotParUsage)
    return router;
};