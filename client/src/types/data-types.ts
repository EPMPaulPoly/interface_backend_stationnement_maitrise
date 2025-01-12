export interface reglement_stationnement{
    id: number,
    desc: string,
    annee_debut:number |null,
    annee_fin : number |null,
    texte_loi: string |null,
    article_loi:string|null,
    para_loi: string |null,
    ville_loi:string |null,
    definition: ligne_description_stationnement[]
}

export interface ligne_description_stationnement{
    id:number,
    id_reg: number,
    ss_ensemble: number,
    seuil: number,
    oper: number|null,
    cases_fixes_min: number|null,
    cases_fixes_max: number|null,
    pente_cases_min: number|null,
    pente_cases_max: number|null,
    unite: number
}

export interface ensembles_reglements_stationnement{
    id: number,
    annee_debut: number,
    annee_fin: number|null,
    description: string,
    table_util_sol: utilisation_sol[],
    assoc_util_reg: association_util_reglement[]
    table_etendue: association_util_reglement[]
}

export interface utilisation_sol{
    cubf:number,
    description:string
}

export interface association_util_reglement{
    id:number,
    cubf:number,
    reglement:number
}

export interface periode{
    id: number,
    description: string,
    annee_debut: number,
    annee_fin: number,
}

export interface territoire{
    id: number,
    id_periode: number,
    ville: string|null,
    secteur: string|null,

}

export interface ensemble_reglement_territoire{
    id:number,
    territoire:territoire,
    ens_reg: ensembles_reglements_stationnement
}

export interface lot_taxation{
    id_lot:string,
    geometry:GeoJSON.GeoJSON
    entrees_role:entree_role_foncier[]
}

export interface entree_role_foncier{
    id_provinc:string,
    annee_role:string,
    nombre_logements:number|null,
    nombre_chambres:number|null,
    superficie_plancher:number|null,
    superficie_terrain:number|null,
    valeur_terrain:number|null,
    valeur_immeuble:number|null,
    valeur_totale:number|null,
    addresse:string|null
}