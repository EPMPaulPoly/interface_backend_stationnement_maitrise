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

export interface parametres_requete_filtree_stationnement{
    annee_debut_avant:number|undefined|null,
    annee_debut_apres:number|undefined,
    annee_fin_avant:number|undefined,
    annee_fin_apres:number|undefined|null,
    ville:string|undefined,
    description:string|undefined,
    texte:string|undefined,
    article:string|undefined,
    paragraphe:string|undefined
}

export interface definition_reglement_stationnement{
    id_reg_stat_emp: number,
    id_reg_stat:number,
    ss_ensemble:number,
    seuil:number,
    oper:number|null,
    cases_fix_min:number,
    cases_fix_max:number|null,
    pente_min:number|null,
    pente_max:number|null,
    unite:number
}

export interface operation_reglement_stationnement{
    id_operation:number,
    desc_operation:string
}
export interface unites_reglement_stationnement{
    id_unite:number,
    desc_unite:string,
    colonne_role_foncier?:string,
    facteur_correction?:number,
    abscisse_correction?:number
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

export interface association_territoire_entete_ensemble_reglement extends entete_ensembles_reglement_stationnement{
    id_asso_er_ter:number,
    id_periode_geo:number,
}

export interface associaion_territoire_ensemble_reglement{
    id_asso_er_ter:number,
    id_er:number,
    id_periode_geo:number
}

export interface utilisation_sol{
    cubf:number,
    description:string
}

export interface comptes_utilisations_sol{
    niveau:number,
    description:string,
    n_entrees:number
}

export interface association_util_reglement{
    id_assoc_er_reg:number,
    cubf:number,
    id_reg_stat:number,
    id_er:number
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

export interface PAVQuartier{
    id_quartier:number,
    nom_quartier:string,
    capacite_stat_quartier:number,
    PAV:entreePAV[]
}
export interface entreePAV{
    id_entree:number,
    heure:number,
    valeur?:number,
    voitures:number,
    voitures_res:number,
    voiture_pub:number,
    permis:number,
    personnes:number,
    voit_entrantes_tot:number,
    voit_entrantes_pub:number,
    voit_entrantes_res:number,
    voit_sortantes_tot:number,
    voit_sortantes_pub:number,
    voit_sortantes_res:number,
    voit_transfer_res_a_pub:number,
    voit_transfer_pub_a_res:number,
    pers_entrantes_tot:number,
    pers_sortantes_tot:number,
    perm_entrants_tot:number,
    perm_sortants_tot:number
}

export interface PAVDataVisOptions{
    id_data_vis:number,
    label: string,
    api_id: string,
    stat_comp:string
}

export interface lotCadastralGeomSeulDb {
    g_no_lot:string;
    geojson_geometry:string;
}

export interface lotCadastralGeoJsonProperties{
    g_no_lot:string,
    g_va_suprf:number,
    g_nb_coord:number,
    g_nb_coo_1:number
}

export interface barChartDataSet{
    valeurVille:number,
    description:'',
    donnees:barChartData[]
}

export interface barChartData{
    id_quartier:number,
    nom_quartier:string,
    valeurs:number
}

export interface lotCadastralDB extends lotCadastralGeoJsonProperties{
    geojson_geometry:string;
}

export interface lotCadastralAvecBoolInvGeoJsonProperties extends lotCadastralGeoJsonProperties{
    bool_inv:boolean
}

export interface lotCadastralBoolInvDB extends lotCadastralAvecBoolInvGeoJsonProperties{
    geojson_geometry:string;
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
    rl0101a:string|null,
    rl0101e:string|null,
    rl0101g:string|null
}

export interface roleFoncierDB extends roleFoncierGeoJsonProps{
    geojson_geometry:string;
}

export interface comboERRoleFoncier{
    ERs:ensemble_reglement_territoire,
    TDs: roleFoncierGeoJsonProps[]
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
    commentaire:string,
    id_inv:number|null,
}


export interface quartiers_analyse{
    id_quartier:number,
    nom_quartier:string,
}

export interface informations_reglementaire_manuelle{
    cubf:number,
    description_cubf:string,
    id_er:number,
    description_er:string,
    ville_sec:string,
    id_provinc_list:string,
    rl0308a_somme:number,
    rl0311a_somme:number,
    rl0404a_somme:number,
    id_reg_stat:number,
    description_reg_stat:string,
    unite:number,
    desc_unite:string
}

export interface InputValues {
    [key:string]:{valeur:number}
}

export interface informations_pour_graph_unite_er_reg{
    id_er:number,
    desc_er:string,
    id_reg_stat:number,
    desc_reg_stat:string,
    unite:number[]
    desc_unite:string[]
}

export interface y_serie_data_graphique{
    label:string,
    data:number[],
    id_er?:number,
    desc_er?:string,
    id_reg_stat?:number,
    desc_reg_stat?: string,
    cubf?:number
}
export interface data_graphique{
    labels:number[]
    datasets:y_serie_data_graphique[]
}

export interface data_graphique_text_labels extends Omit<data_graphique, "labels"> {
    labels: string[]
}

export type data_box_plot = ChartData<'boxplot', BoxPlotDataPoint[], string>;

export interface methodeAnalyseVariabillite{
    idMethodeAnalyse:number,
    descriptionMethodeAnalyse:string
}

export interface resultatAnalyseVariabilite{
    id_er: number,
    description_er: string,
    valeur: number,
    cubf: number,
    desc_cubf: string
    n_lots: number
    facteur_echelle:number
}

export interface resultatHistoVariabilite{
    cubf: number,
    desc_cubf: string,
    interval_pred: string,
    frequence: number
}

export interface requete_calcul_manuel_reg{
    g_no_lot:string,
    cubf:number,
    id_reg_stat:number,
    id_er:number,
    unite:number,
    valeur:number,
}

export interface ProprietesRequetesER{
    dateDebutAvant?:number|null,
    dateDebutApres?:number|null,
    dateFinAvant?:number|null,
    dateFinApres?:number|null,
    descriptionLike?:string,
    idER?:number|number[]
}

export type ConditionStrate =
  | { condition_type: "equals"; condition_valeur: string | number }
  | { condition_type: "range"; condition_min: number; condition_max: number };

// Recursive Strata definition
export interface Strate {
    id_strate:number,
    nom_strate:string,
    nom_table: string;
    nom_colonne: string;
    ids_enfants:number[]|null,
    est_racine:boolean|null,
    index_ordre:number,
    condition: ConditionStrate;
    subStrata?: Strate[]; // recursion
    n_sample?:number|null;
    logements_valides:boolean|null;
    superf_valide: boolean|null;
    date_valide:boolean|null;
}


export interface FeuilleFinaleStrate{
    id_strate:number,
    desc_concat:string,
    n_sample?:number,
    popu_strate?:number
}

export interface EntreeValidation{
    g_no_lot:string,
    id_strate:number,
    n_places:number,
    fond_tuile:string,
    id_val:number
}

export type methodeCalcul = {
    methode_estime:number,
    description:string
}