import {periode,territoire,quartiers_analyse,inventaire_stationnement,territoireGeoJsonProperties,entete_reglement_stationnement, reglement_complet,entete_ensembles_reglement_stationnement, ensemble_reglements_stationnement, inventaireGeoJSONProps, lotCadastralGeoJsonProperties, roleFoncierGeoJsonProps, lotCadastralDB, roleFoncierDB, lotCadastralGeomSeulDb, comboERRoleFoncier, lotCadastralBoolInvDB, lotCadastralAvecBoolInvGeoJsonProperties} from './DataTypes'
import { Feature, FeatureCollection,Geometry } from 'geojson';
import { GeoJSONPropsAnaQuartierTotal, GeoJSONPropsAnaQuartierTotalParHab, GeoJSONPropsAnaQuartierTotalParSuperf, StatTotalDBAnaQuartier, StatTotalParSuperfDBAnaQuartier } from './AnalysisTypes';
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
export type ReponseInventaire = ApiResponse<inventaire_stationnement[]>
export type ReponseEntetesReglements = ApiResponse<entete_reglement_stationnement[]>
export type ReponseReglementComplet = ApiResponse<reglement_complet[]>
export type ReponseEntetesEnsemblesReglement = ApiResponse<entete_ensembles_reglement_stationnement[]>
export type ReponseEnsembleReglementComplet = ApiResponse<ensemble_reglements_stationnement[]>
export type ReponseCadastre = ApiResponse<FeatureCollection<Geometry,lotCadastralGeoJsonProperties>>
export type ReponseCadastreBoolInv = ApiResponse<FeatureCollection<Geometry,lotCadastralAvecBoolInvGeoJsonProperties>>
export type ReponseRole = ApiResponse<FeatureCollection<Geometry,roleFoncierGeoJsonProps>>
export type ReponseDBCadastre = ApiResponse<lotCadastralDB[]>
export type ReponseDBCadastreBoolInv = ApiResponse<lotCadastralBoolInvDB[]>
export type ReponseDBRole = ApiResponse<roleFoncierDB[]>
export type ReponseDBCadastreGeoSeul = ApiResponse<lotCadastralGeomSeulDb[]>
export type ReponseComboERsRoleFoncier = ApiResponse<comboERRoleFoncier[]>
export type ReponseDBInfoInventaireReglementManuel = ApiResponse<informations_reglementaire_manuelle[]>
export type ReponseDBInventaireAgregQuartTotal = ApiResponse<StatTotalDBAnaQuartier[]>
export type ReponseInventaireAgregQuartTotal = ApiResponse<FeatureCollection<Geometry,GeoJSONPropsAnaQuartierTotal>>
export type ReponseDBInventaireAgregQuartParHab = ApiResponse<StatTotalParHabDBAnaQuartier[]>
export type ReponseInventaireAgregQuartParHab = ApiResponse<FeatureCollection<Geometry,GeoJSONPropsAnaQuartierTotalParHab>>
export type ReponseDBInventaireAgregQuartParSuperf = ApiResponse<StatTotalParSuperfDBAnaQuartier[]>
export type ReponseInventaireAgregQuartParSuperf = ApiResponse<FeatureCollection<Geometry,GeoJSONPropsAnaQuartierTotalParSuperf>>