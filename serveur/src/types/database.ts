import { ParamsDictionary } from 'express-serve-static-core';
import GeoJSON from 'geojson';

export interface DbQuartierAnalyse{
    id_quartier:number,
    nom_quartier:string,
    superf_quartier:number,
    peri_quartier:number,
    geometry: GeoJSON.GeoJSON;  // Geometry(Geometry,32187)
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

export interface ParamsQuartier extends ParamsDictionary {
    id: string;
  }