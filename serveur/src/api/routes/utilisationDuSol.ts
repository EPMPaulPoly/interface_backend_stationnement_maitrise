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

            console.log('typecheck',(typeof(cubf) !== 'string' && typeof(Number(cubf)) !== 'number' && typeof(niveau)!=='string' && typeof(Number(niveau))!=='number'))
            if (typeof(cubf) !== 'string' && typeof(Number(cubf)) !== 'number' && typeof(niveau)!=='string' && typeof(Number(niveau))!=='number' ) {
                // type guard
            } else if (typeof(cubf)==='undefined' && typeof(niveau)==='undefined'){
                query = `SELECT 
                    *
                    FROM
                        public.cubf `;
                result = await client.query(query)
            } else if (Number(niveau)===1) {
                query = `SELECT 
                    *
                    FROM
                        public.cubf 
                    WHERE 
                        cubf<10`;
                result = await client.query(query)
            } else if (Number(niveau)===2 && (Number(cubf)<10)) {
                const minCubf = Number(cubf)*10;
                const maxCubf = Number(cubf)*10 +9;
                query = `SELECT 
                        *
                    FROM
                        public.cubf 
                    WHERE 
                        cubf>=${minCubf} AND cubf<=${maxCubf}`;
                result = await client.query(query)
            } else if (Number(niveau)===3 && (Number(cubf)>=10 && Number(cubf) < 100)) {
                const minCubf = Number(cubf)*10;
                const maxCubf = Number(cubf)*10 +9;
                query = `SELECT 
                        *
                    FROM
                        public.cubf 
                    WHERE 
                        cubf>=${minCubf} AND cubf<=${maxCubf}`;
                result = await client.query(query)
            } else if (Number(niveau)===4 && (Number(cubf)>=100 && Number(cubf) < 1000)) {
                const minCubf = Number(cubf)*10;
                const maxCubf = Number(cubf)*10 +9;
                query = `SELECT 
                        *
                    FROM
                        public.cubf 
                    WHERE 
                        cubf>=${minCubf} AND cubf<=${maxCubf}`;
                result = await client.query(query)
            } else if(Number(cubf)>=1000){
                query = `SELECT 
                        *
                    FROM
                        public.cubf 
                    WHERE 
                        cubf=${cubf}`;
                result = await client.query(query)
            }
            else {
                // Handle other cases or throw an error if needed
                throw new Error('combinaison invalide de cubf et niveau');
            }
            res.json({ success: true, data: result.rows });
        } catch (err) {
            res.status(500).json({ success: false, error: 'Database error' });
        } finally {
            if (client) {
                client.release()
            }
        }
    };



    // Routes
    router.get('/', obtiensCUBF)
    return router;
};