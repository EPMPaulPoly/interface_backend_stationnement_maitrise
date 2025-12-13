import {Pool} from 'pg'


export type GetReglementsParams = {
    reg_complet: boolean;
    id_reg_stat?: number|number[];
    annee_debut_avant?: number | null;
    annee_debut_apres?: number;
    annee_fin_avant?: number;
    annee_fin_apres?: number | null;
    description?: string;
    ville?: string;
    texte?: string;
    paragraphe?: string;
    article?:string;
    unite?: number | number[];
    id_er?: number | number[];
    id_periode_geo?: number | number[];
    id_periode?: number | number[];
    cubf?: number | number[];
};

export type GetReglementsQueries = {
    sql_entete: string;
    entete_params: any[];
    sql_def: string;
    def_params: any[];
    sql_unite: string;
    unite_params: any[];
};

export type ruleHeader={
    id_reg_stat: number,
    description: string,
    ville: string,
    annee_debut_reg: number|null,
    annee_fin_reg: number|null,
    texte_loi: string,
    article_loi:string,
    paragraphe_loi:string
}

export type ruleDef={
    id_reg_stat_emp: number,
    id_reg_stat: number,
    ss_ensemble:number,
    seuil: number|null,
    oper: number|null,
    cases_fix_min: number|null,
    cases_fix_max: number|null,
    pente_min: number|null,
    pente_max: number|null,
    unite: number
}

export type unitDef={
    id_unite: number,
    desc_unite:number
}

export const construitRequetesGetReglements = (params: GetReglementsParams): GetReglementsQueries => {
    let sql_entete_final: string = '';
    let entete_params_final: any[] = [];
    let sql_def_final: string = '';
    let def_params_final: any[] = [];
    let sql_unite_final: string = '';
    let unite_params_final: any[] = [];
    if (params.reg_complet===true){
        
    }
    let conditions: string[] = [];
    let values: any[] = [];
    let paramIndex:number = 1;
    let cteJoins: string[] = []
    const possibleJoins:string[] = [
        'LEFT JOIN association_er_reg_stat_etendu aerse on aerse.id_reg_stat = vpr.id_reg_stat',
        'LEFT JOIN vue_periode_terr_er vpte on vpte.id_er=aerse.id_er'
    ]

    const addCondition = (sql: string, value: any) => {
        conditions.push(sql.replace('?', `$${paramIndex}`));
        values.push(value);
        paramIndex++;
    };


    if (params.annee_debut_apres !== undefined) {
        if (params.annee_debut_apres === null) {
            conditions.push('vpr.annee_debut_reg IS NULL');
        } else {
            addCondition('vpr.annee_debut_reg >= ?', Number(params.annee_debut_apres));
        }
    }

    if (params.annee_debut_avant !== undefined) {
        if (params.annee_debut_avant === null) {
            conditions.push('vpr.annee_debut_reg IS NULL');
        } else {
            addCondition('vpr.annee_debut_reg <= ?', Number(params.annee_debut_avant));
        }
    }

    if (params.annee_fin_apres !== undefined) {
        if (params.annee_fin_apres === null) {
            conditions.push('vpr.annee_fin_reg IS NULL');
        } else {
            addCondition('vpr.annee_fin_reg >= ?', Number(params.annee_fin_apres));
        }
    }

    if (params.annee_fin_avant !== undefined) {
        if (params.annee_fin_avant === null) {
            conditions.push('vpr.annee_fin_reg IS NULL');
        } else {
            addCondition('vpr.annee_fin_reg <= ?', Number(params.annee_fin_avant));
        }
    }

    if (params.description !== undefined) {
        addCondition(`to_tsvector('french', vpr.description) @@ plainto_tsquery('french', ?)`, decodeURIComponent(params.description as string));
    }

    if (params.ville !== undefined) {
        addCondition(`to_tsvector('french', vpr.ville) @@ plainto_tsquery('french', ?)`, decodeURIComponent(params.ville as string));
    }

    if (params.texte !== undefined) {
        addCondition(`to_tsvector('french', vpr.texte_loi) @@ plainto_tsquery('french', ?)`, decodeURIComponent(params.texte as string));
    }

    if (params.paragraphe !== undefined) {
        addCondition(`to_tsvector('french', vpr.paragraphe_loi) @@ plainto_tsquery('french', ?)`, decodeURIComponent(params.paragraphe as string));
    }

    if (params.article !== undefined) {
        addCondition(`to_tsvector('french', vprarticle_loi) @@ plainto_tsquery('french', ?)`, decodeURIComponent(params.article as string));
    }

    if (params.cubf!== undefined){
        cteJoins.push(possibleJoins[0])
        addCondition('aerse.cubf = any(?)',params.cubf)
    }

    if (params.id_er!==undefined){
        cteJoins.push(possibleJoins[0])
        addCondition('aerse.id_er = any(?)',params.id_er)
    }

    if (params.id_periode!==undefined){
        cteJoins.push(possibleJoins[0])
        cteJoins.push(possibleJoins[1])
        addCondition('vpte.id_periode =any(?)',params.id_periode)
    }
    if (params.id_periode_geo){
        cteJoins.push(possibleJoins[0])
        cteJoins.push(possibleJoins[1])
        addCondition('vpte.id_periode_geo =any(?)',params.id_periode_geo)
    }
    if (params.unite!== undefined){
        cteJoins.push(possibleJoins[0])
        addCondition('vpr.unites_utilisees && ?',params.unite)
    }
    if (params.id_reg_stat!==undefined){
        addCondition('vpr.id_reg_stat = any(?)',params.id_reg_stat)
    }
    cteJoins = [...new Set(cteJoins)]
    const ancilary_values_header = `WITH selection_universe AS (
        SELECT
            DISTINCT vpr.id_reg_stat 
        FROM
            vue_parametres_reglements vpr
        ${cteJoins.length>0?cteJoins.join('\n'):''}
        ${conditions.length>0?'WHERE '+conditions.join(' AND '):''}
    )
    `
    sql_entete_final = ancilary_values_header + `SELECT id_reg_stat,description,annee_debut_reg,annee_fin_reg,texte_loi,article_loi,paragraphe_loi,ville FROM entete_reg_stationnement ers 
    where id_reg_stat in (SELECT id_reg_stat FROM selection_universe)`
    sql_def_final = ancilary_values_header + `SELECT * FROM reg_stationnement_empile  rse 
    where id_reg_stat in (SELECT id_reg_stat FROM selection_universe)`
    entete_params_final = values
    def_params_final = values
    sql_unite_final = 'SELECT id_unite, desc_unite from multiplicateur_facteurs_colonnes'
    unite_params_final = []
    return {
        sql_entete: sql_entete_final,
        entete_params: entete_params_final,
        sql_def: sql_def_final,
        def_params: def_params_final,
        sql_unite: sql_unite_final,
        unite_params: unite_params_final
    };
};


export const rouleRequetesSQLGet = async (pool:Pool, query_data:GetReglementsQueries,complete: boolean) => {
    let client;
    try{
        client = await pool.connect()
        if (complete === true){
            const [head,def,units] =  await Promise.all([client.query<ruleHeader[]>(query_data.sql_entete,query_data.entete_params), client.query<ruleDef>(query_data.sql_def,query_data.def_params),client.query<unitDef>(query_data.sql_unite)])
            return [head.rows,def.rows,units.rows]
        } else{
            const head = await client.query(query_data.sql_entete,query_data.entete_params)
            return [head.rows,[],[]]
        }
    } finally{
        client?.release()
    }
}