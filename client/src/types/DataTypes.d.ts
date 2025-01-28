import Geometry from 'geojson';

export interface entete_reglement_stationnement{
    id_reg_stat: number,
    description: string,
    annee_debut_reg:number |null,
    annee_fin_reg: number |null,
    texte_loi: string |null,
    article_loi:string|null,
    paragraphe_loi: string |null,
    ville:string |null
}

export interface definition_reglement_stationnement{
    id_reg_stat_emp: number,
    id_reg_stat:number,
    ss_ensemble:number,
    seuil:number,
    oper:number,
    cases_fix_min:number,
    cases_fix_max:number,
    pente_min:number,
    pente_max:number,
    unite:number
}

export interface reglement_complet{
    entete: entete_reglement_stationnement,
    definition:definition_reglement_stationnement[]
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

export interface ensemble_reglements_stationnement{
    entete: entete_ensembles_reglement_stationnement,
    table_util_sol: utilisation_sol[],
    assoc_util_reg: association_util_reglement[]
    table_etendue: association_util_reglement[]
}

export interface entete_ensembles_reglement_stationnement{
    id_er: number,
    date_debut_er: number,
    date_fin_er: number|null,
    description_er: string,
}

export interface utilisation_sol{
    cubf:number,
    description:string
}

export interface association_util_reglement{
    id_assoc_er_reg:number,
    cubf:number,
    id_reg_stat:number
}

export interface periode{
    id_periode: number,
    nom_periode: string,
    date_debut_periode: number,
    date_fin_periode: number,
}

export interface territoire{
    id_periode_geo: number,
    id_periode: number,
    ville: string|null,
    secteur: string|null,
    geojson_geometry: Geometry
}

export interface territoireGeoJsonProperties {
    id_periode_geo:number,
    id_periode:number,
    ville:string|null,
    secteur:string|null
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

export interface lotCadastralGeoJsonProperties{
    g_no_lot:string,
    g_va_superf:number,
    g_nb_coord:number,
    g_nb_coo_1:number
}

export interface roleFoncierGeoJsonProps{
    id_provinc:number,
    rl0105a:number,
    rl0306a:number,
    rl0307a:number,
    rl0307b:string,
    rl0308a:number,
    rl0311a:number,
    rl0312a:number,
    rl0404a:number,
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

export interface inventaire_stationnement{
    g_no_lot:string,
    n_places_min:number,
    n_places_max:number,
    n_places_mesure:number,
    n_places_estime:number,
    methode_estime:number,
    id_er: string,
    id_reg_stat:string,
    cubf:string,
    geojson_geometry:Geometry
}

export interface inventaireGeoJSONProps{
    g_no_lot:string,
    n_places_min:number,
    n_places_max:number,
    n_places_mesure:number,
    n_places_estime:number,
    methode_estime:number,
    id_er: string,
    id_reg_stat:string,
    cubf:string,
}

export interface quartiers_analyse{
    id_quartier:number,
    nom_quartier:string,
}