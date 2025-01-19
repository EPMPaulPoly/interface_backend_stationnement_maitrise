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

export interface ParamsQuartier extends ParamsDictionary {
    id: string;
}

export interface ParamsPeriode extends ParamsDictionary {
    id: string;
}