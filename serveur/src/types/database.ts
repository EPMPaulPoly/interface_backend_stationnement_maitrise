import { ParamsDictionary } from 'express-serve-static-core';
import GeoJSON from 'geojson';

export interface DbQuartierAnalyse{
    id_quartier:number,
    nom_quartier:string,
    superf_quartier:number,
    peri_quartier:number,
    geometry: GeoJSON.GeoJSON;  // Geometry(Geometry,4326)
}

export interface DbTerritoire{
    id_periode_geo:number,
    ville:string,
    secteur:number,
    id_periode:number,
    geometry: GeoJSON.GeoJSON;  // Geometry(Geometry,4326)
}
export interface DbRole{
    id_provinc:string,
    rl0105a:string,
    rl0306a:number,
    rl0307a:string,
    rl0307b:string,
    rl0308a:number,
    rl0311a:number,
    rl0312a:number,
    rl0404a:number,
    geometry: GeoJSON.GeoJSON
}

export interface DbCadastre{
    g_no_lot:string,
    g_nb_coord:number,
    g_nb_coo_1:number,
    g_va_suprf:number,
}

export interface DbCadastreGeomIdOnly{
    g_no_lot:string,
    geometry:string
}

export interface DbHistoriqueGeopol{
    id_periode:number,
    nom_periode:string,
    date_debut_periode:number,
    date_fin_periode:number
}

export interface DbInventaire{
    g_no_lot:string,
    n_places_min:number,
    n_places_max:number,
    n_places_est:number,
    n_places_mes:number,
    methode_estime:number,
    id_er:string,
    id_reg_stat:string,
    cubf:number,
    geometry: GeoJSON.GeoJSON
}

export interface DbEnteteReglement{
    id_reg_stat:number,
    description:string,
    annee_debut_reg: number,
    annee_fin_reg:number,
    texte_loi:string,
    article_loi:string,
    paragraphe_loi:string,
    ville:string
}

export interface DbDefReglement{
    id_reg_stat_emp:number,
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

export interface DbEnteteEnsembleReglement{
    id_er:number,
    date_debut_er:number,
    date_fin_er:number,
    description_er:string,
}

export interface DbReglementComplet{
    entete: DbEnteteReglement,
    definition:DbDefReglement[]
}

export interface DbUtilisationSol{
    cubf:number,
    description:string
}

export interface DbAssociationReglementUtilSol{
    id_assoc_er_reg:number,
    cubf:number,
    id_reg_stat:number,
    id_er:number
}

export interface RequeteInventaire{
    g_no_lot:string,
    n_places_min:number,
    n_places_max:number,
    n_places_mesure:number,
    n_places_estime:number,
    id_er:string,
    id_reg_stat:string,
    commentaire:string,
    methode_estime:number,
    cubf:string,
}

export interface RequeteCalculeInventaireRegMan{
    cubf:number,
    id_reg_stat:number,
    unite:number,
    valeur:number
}

export interface DbDonneesRequetesCalculValeursManuelles{
    rl0105a:string,
    rl0307a:string,
    id_er:number,
    description_er:string,
    id_periode_geo:number,
    ville_sec:string,
    id_provincial_list:string,
    rl0308a_somme:number,
    rl0311a_somme:number,
    rl0312a_somme:number,
    id_reg_stat:number,
    description_reg_stat:string,
    unite:number,
    desc_unite:string
}

export interface ParamsQuartier extends ParamsDictionary {
    id: string;
}

export interface ParamsPeriode extends ParamsDictionary {
    id: string;
}

export interface ParamsCadastre extends ParamsDictionary{
    id:string;
}

export interface ParamsTerritoire extends ParamsDictionary{
    id:string;
}

export interface ParamsLot extends ParamsDictionary{
    id:string;
}

export interface ParamsInventaire extends ParamsDictionary{
    id_inv:string;
}

export interface ParamsRole extends ParamsDictionary{
    id_role:string;
}