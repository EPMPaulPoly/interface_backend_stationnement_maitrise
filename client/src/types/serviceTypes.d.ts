import {periode,territoire,quartiers_analyse,inventaire_stationnement,territoireGeoJsonProperties} from './DataTypes'
import { Feature, FeatureCollection,Geometry } from 'geojson';

export interface ApiResponse<T> {
    success?: boolean;
    data: T;
    error?: string;
  }

export type ReponsePeriode = ApiResponse<periode[]>
export type ReponseDbTerritoire = ApiResponse<territoire[]>
export type ReponseTerritoire = ApiResponse<FeatureCollection<Geometry,territoireGeoJsonProperties>>
export type ReponseQuartiersAnalyse = ApiResponse<quartiers_analyse[]>
export type ReponseInventaire = ApiResponse<inventaire_stationnement[]>