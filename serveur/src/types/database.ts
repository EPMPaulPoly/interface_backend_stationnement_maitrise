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