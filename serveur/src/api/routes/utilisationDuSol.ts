import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';

export const creationRouteurUtilsationDuSol = (pool: Pool): Router => {
    const router = Router();
    // Get all lines
    // Get all lines
    const obtiensCUBF: RequestHandler<void> = async (req, res): Promise<void> => {
        console.log('obtention utilsation du sol')
        let client;
        try {
            const { niveau, cubf } = req.query;
            client = await pool.connect();
            let query: string
            let result: any;

            if (typeof(cubf) !== 'string' && typeof(Number(cubf)) !== 'number' && typeof(niveau)!=='string' && typeof(Number(niveau))!=='number' ) {
                // type guard
                console.log('entering typeguard')
            } else if (typeof(cubf)==='undefined' && typeof(niveau)==='undefined'){
                query = `SELECT 
                        cubf::int,
                        description
                    FROM
                        public.cubf 
                    order by cubf asc`;
                result = await client.query(query)
            } else if (Number(niveau)===1) {
                query = `SELECT 
                        cubf::int,
                        description
                    FROM
                        public.cubf 
                    WHERE 
                        cubf<10
                    order by cubf asc`;
                result = await client.query(query)
            } else if (Number(niveau)===2 ) {
                let minCubf = 10;
                let maxCubf = 99;
                if (Number(cubf)<10){
                    minCubf = Number(cubf)*10;
                    maxCubf = Number(cubf)*10 +9;
                } else if(Number(cubf)>10){
                    throw new Error('Combinaison invalide de niveau et cubf')
                }
                query = `SELECT 
                        cubf::int,
                        description
                    FROM
                        public.cubf 
                    WHERE 
                        cubf>=${minCubf} AND cubf<=${maxCubf}
                    order by cubf asc`;
                result = await client.query(query)
            } else if (Number(niveau)===3 ) {
                let minCubf = 100;
                let maxCubf = 999;
                if ((Number(cubf)>=10 && Number(cubf) < 100)){
                    minCubf = Number(cubf)*10;
                    maxCubf = Number(cubf)*10 +9;
                } else if ((Number(cubf)<10 || Number(cubf) >= 100)){
                    throw new Error('Combinaison invalide de niveau et cubf')
                }
                query = `SELECT 
                        cubf::int,
                        description
                    FROM
                        public.cubf 
                    WHERE 
                        cubf>=${minCubf} AND cubf<=${maxCubf}
                    order by cubf asc`;
                result = await client.query(query)
            } else if (Number(niveau)===4 ) {
                let minCubf = 1000;
                let maxCubf = 9999;
                if ((Number(cubf)>=100 || Number(cubf) < 1000)){
                    minCubf = Number(cubf)*10;
                    maxCubf = Number(cubf)*10 +9;
                } else if (((Number(cubf)<100 || Number(cubf) >= 1000))){
                    throw new Error('Combinaison invalide de niveau et cubf')
                }
                query = `SELECT 
                        cubf::int,
                        description
                    FROM
                        public.cubf 
                    WHERE 
                        cubf>=${minCubf} AND cubf<=${maxCubf}
                    order by cubf asc`;
                result = await client.query(query)
            } else if(Number(cubf)>=1){
                query = `SELECT 
                        cubf::int,
                        description
                    FROM
                        public.cubf 
                    WHERE 
                        cubf=${cubf}
                    order by cubf asc`;
                result = await client.query(query)
            } else {
                // Handle other cases or throw an error if needed
                throw new Error('Combinaison invalide de niveau et cubf');
            }
            res.json({ success: true, data: result.rows });
        } catch (err:any) {
            if (err.message ==='Combinaison invalide de niveau et cubf'){
                res.status(400).json({ success: false, error: 'Combinaison invalide de niveau et cubf' });
            } else{
            res.status(500).json({ success: false, error: 'Database error' });
            }
        } finally {
            if (client) {
                client.release()
            }
        }
    };
    const obtiensNFeuilles:RequestHandler<void> = async(req,res):Promise<void>=>{
        console.log('obtention nombre utilisation du sol par niveau')
        let client;
        try {
            client = await pool.connect();
            let query: string
            let result: any;
            query = `
                SELECT 
                    1 as niveau, 
                    'CUBF 1 à 9' AS description, 
                    COUNT(*)::int AS n_entrees
                FROM cubf
                WHERE cubf::int BETWEEN 1 AND 9

                UNION ALL

                SELECT 
                    2 as niveau,
                    'CUBF 10 à 99' AS description, 
                    COUNT(*)::int AS n_entrees
                FROM cubf
                WHERE cubf::int BETWEEN 10 AND 99

                UNION ALL

                SELECT 
                    3 as niveau,
                    'CUBF 100 à 999' AS description, 
                    COUNT(*)::int AS n_entrees
                FROM cubf
                WHERE cubf::int BETWEEN 100 AND 999

                UNION ALL

                SELECT 
                    4 as niveau,
                    'CUBF 1000 à 9999' AS description, 
                    COUNT(*)::int AS n_entrees
                FROM cubf
                WHERE cubf::int BETWEEN 1000 AND 9999;

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


    // Routes
    router.get('/', obtiensCUBF)
    router.get('/n_entrees',obtiensNFeuilles)
    return router;
};