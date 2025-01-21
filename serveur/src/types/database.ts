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
    id_reg_stat:number
}

export interface ParamsQuartier extends ParamsDictionary {
    id: string;
}

export interface ParamsPeriode extends ParamsDictionary {
    id: string;
}