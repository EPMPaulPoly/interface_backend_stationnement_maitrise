import {periode,territoire,quartiers_analyse,inventaire_stationnement,territoireGeoJsonProperties,entete_reglement_stationnement, reglement_complet,entete_ensembles_reglement_stationnement, ensemble_reglements_stationnement, inventaireGeoJSONProps} from './DataTypes'
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
export type ReponseDBInventaire = ApiResponse<inventaire_stationnement[]>
export type ReponseInventaire = ApiResponse<FeatureCollection<Geometry,inventaireGeoJSONProps>>
export type ReponseEntetesReglements = ApiResponse<entete_reglement_stationnement[]>
export type ReponseReglementComplet = ApiResponse<reglement_complet>
export type ReponseEntetesEnsemblesReglement = ApiResponse<entete_ensembles_reglement_stationnement[]>
export type ReponseEnsembleReglementComplet = ApiResponse<ensemble_reglements_stationnement>