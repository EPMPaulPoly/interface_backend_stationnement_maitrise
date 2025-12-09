import { Pool } from "pg"

export const construitRequeteSQLAnavar = (
    params:{
        id_er: number[],
        cubf_n1: number,
        id_ref: number,
        voir_inv:boolean,
        inclure_echelle:boolean,
        somme_sur_total: boolean
})=>{
    const LAND_USE_DESC_CTE = `land_use_desc AS(SELECT cubf::int as land_use, description as land_use_desc FROM cubf)`
    const REG_SET_DEFS_CTE = 'reg_set_defs AS (SELECT id_er, description_er FROM ensembles_reglements_stat)'
    const BASE_DATA_CTE = `base_data AS(SELECT id_er, land_use, n_places_min as n_places_ref FROM variabilite WHERE id_er = ${params.id_ref} and facteur_echelle=1)`

    let ctes_inv: string[] = [];
    let ctes_va: string[] = [];
    ctes_va.push(LAND_USE_DESC_CTE)
    ctes_va.push(REG_SET_DEFS_CTE)
    if (params.id_ref !==-1){
        ctes_va.push(BASE_DATA_CTE)
    }

    let query_inv: string = '';
    let base_query_inv: string = '';
    let query_va: string = '';
    let base_query_va: string = '';
    let conditions: string[] = [];
    let conditions_inv: string[] = [];
    let groupbys_inv: string[] = [];
    let groupbys_va: string[] = [];
    let val_int_inv:string ='';
    let val_int_va:string = '';
    if (params.id_er.length>0){
        conditions.push(`av.id_er IN (${params.id_er.join(',')})`)
    }
    if (params.cubf_n1!==-1){
        conditions.push(`av.land_use=${params.cubf_n1}`)
        conditions_inv.push(`inv.land_use=${params.cubf_n1}`)
    }
    if (params.inclure_echelle===false){
        conditions.push(`facteur_echelle=1`)
    }
    if (params.somme_sur_total===true && params.cubf_n1 ===-1){
        if (params.id_ref!==-1){
            val_int_inv = 'coalesce(sum(inv.n_places_min) / nullif(sum(bd.n_places_ref),0)*100,0)'
            val_int_va = 'coalesce(sum(av.n_places_min) / nullif(sum(bd.n_places_ref),0)*100,0) '
        }else{
            val_int_inv = 'SUM(inv.n_places_min)'
            val_int_va = 'SUM(av.n_places_min)'
        }
        base_query_inv = `
            SELECT
                ${val_int_inv} as valeur,
                -5::int as id_er,
                'Inventaire Actuel' as description_er,
                'TOUS' as desc_cubf,
                -1 as cubf,
                1 as facteur_echelle
            FROM
                inv_reg_aggreg_cubf_n1 inv`
        base_query_va = `
            SELECT 
                ${val_int_va} as valeur,
                av.id_er::int,
                rsd.description_er,
                'TOUS' as desc_cubf,
                -1 as cubf,
                av.facteur_echelle
            FROM
                variabilite av
            LEFT JOIN reg_set_defs rsd on rsd.id_er = av.id_er
        `
        groupbys_inv = []
        groupbys_va  = ['av.id_er','rsd.description_er','av.facteur_echelle']
    } else{
        if (params.id_ref!==-1){
            val_int_inv = 'coalesce(inv.n_places_min / nullif(bd.n_places_ref,0)*100,0)'
            val_int_va = 'coalesce(av.n_places_min / nullif(bd.n_places_ref,0)*100,0)'
        } else{
            val_int_inv = 'inv.n_places_min'
            val_int_va = 'av.n_places_min'
        }
        base_query_inv = `
            SELECT
                ${val_int_inv} as valeur,
                -5::int as id_er,
                'Inventaire Actuel' as description_er,
                inv.land_use as cubf,
                lud.land_use_desc as desc_cubf,
                1 as facteur_echelle
            FROM
                inv_reg_aggreg_cubf_n1 inv
            ${params.id_ref!==-1?'LEFT JOIN base_data ON bd.land_use = inv.land_use\n':''}LEFT JOIN land_use_desc lud ON lud.land_use=inv.land_use `
        base_query_va = `
            SELECT 
                ${val_int_va} as valeur,
                av.id_er::int,
                rsd.description_er,
                av.land_use as cubf,
                lud.land_use_desc as desc_cubf,
                av.facteur_echelle
            FROM
                variabilite av
            LEFT JOIN reg_set_defs rsd on rsd.id_er = av.id_er
            LEFT JOIN land_use_desc lud ON lud.land_use=av.land_use ${params.id_ref!==-1?'\n LEFT JOIN base_data ON bd.land_use = inv.land_use ':''}
        `
        groupbys_inv = []
        groupbys_va  = []
    }
    query_inv =  base_query_inv +'\n'+ (conditions_inv.length>0?'WHERE ' + conditions_inv.join(','):'') + '\n' + (groupbys_inv.length>0? 'GROUP BY ' + groupbys_inv.join(','):'')
    query_va = base_query_va+ '\n' + (conditions.length>0?'WHERE ' + conditions.join(' AND '):'') + '\n' + (groupbys_va.length>0? 'GROUP BY ' + groupbys_va.join(','):'')
    let return_string: string = '';
    if (params.voir_inv=== true){
        return_string = (ctes_va.length>0?'WITH ' + ctes_va.join(',\n'):"")+'\n' + `${query_inv}\n UNION ALL \n ${query_va}`
    }else{
        return_string = (ctes_va.length>0?'WITH ' + ctes_va.join(',\n'):"")+'\n'+`${query_va}`
    }

    return return_string
}


export const rouleRequeteSQL= async (pool: Pool,requete:string)=>{
    let client = await pool.connect()
    try{
        const resultat = await client.query(requete);
        return resultat.rows;
    } finally{
        client.release()
    }
}