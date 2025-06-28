import {periode,territoire,quartiers_analyse,inventaire_stationnement,territoireGeoJsonProperties,entete_reglement_stationnement, reglement_complet,entete_ensembles_reglement_stationnement, ensemble_reglements_stationnement, inventaireGeoJSONProps, lotCadastralGeoJsonProperties, roleFoncierGeoJsonProps, lotCadastralDB, roleFoncierDB, lotCadastralGeomSeulDb, comboERRoleFoncier, lotCadastralBoolInvDB, lotCadastralAvecBoolInvGeoJsonProperties, PAV_quartier, entreePAV, operation_reglement_stationnement, unites_reglement_stationnement, definition_reglement_stationnement, association_territoire_entete_ensemble_reglement, association_util_reglement, utilisation_sol, associaion_territoire_ensemble_reglement, data_graphique, comptes_utilisations_sol} from './DataTypes'
import { Feature, FeatureCollection,Geometry } from 'geojson';
import { GeoJSONPropsAnaQuartierTotal, GeoJSONPropsAnaQuartierTotalParHab, GeoJSONPropsAnaQuartierTotalParSuperf, NhoodXYGraphDatasets, StatTotalDBAnaQuartier, StatTotalParSuperfDBAnaQuartier, VariableCartoDBAnaQuartier } from './AnalysisTypes';
export interface ApiResponse<T> {
    success?: boolean;
    data: T;
    error?: string;
  }

// Historique
export type ReponsePeriode = ApiResponse<periode[]>
export type ReponseDbTerritoire = ApiResponse<territoire[]>
export type ReponseTerritoire = ApiResponse<FeatureCollection<Geometry,territoireGeoJsonProperties>>
// quartier analyse
export type ReponseQuartiersAnalyse = ApiResponse<quartiers_analyse[]>
// inventaire
export type ReponseDBInventaire = ApiResponse<inventaire_stationnement[]>
export type ReponseInventaire = ApiResponse<inventaire_stationnement[]>
export type ReponseInventaireSeuil = ApiResponse<inventaire_stationnement>
// reglements
export type ReponseEntetesReglements = ApiResponse<entete_reglement_stationnement[]>
export type ReponseReglementComplet = ApiResponse<reglement_complet[]>
export type ReponseOperationsReglements = ApiResponse<operation_reglement_stationnement[]>
export type ReponseUnitesReglements = ApiResponse<unites_reglement_stationnement[]>
export type ReponseLigneDefReglement = ApiReponse<definition_reglement_stationnement>
// ensemble reglements
export type ReponseEnteteEnsembleReglementStationnement = ApiResponse<entete_ensembles_reglement_stationnement>
export type ReponseEntetesEnsemblesReglement = ApiResponse<entete_ensembles_reglement_stationnement[]>
export type ReponseAssociationEnsembleReglement = ApiResponse<association_util_reglement>
export type ReponseAssociationsEnsembleReglement = ApiResponse<association_util_reglement[]>
export type ReponseCUBF = ApiResponse<utilisation_sol[]>
export type ReponseCompteCUBF = ApiResponse<comptes_utilisations_sol[]>
// ensemble reglement territoire
export type ReponseAssosTerritoireEnteteEnsembleReglement = ApiResponse<association_territoire_entete_ensemble_reglement[]>
export type ReponseAssoTerritoireEnsembleReglement = ApiResponse<associaion_territoire_ensemble_reglement>
export type ReponseEnsembleReglementComplet = ApiResponse<ensemble_reglements_stationnement[]>
// lots cadastraux et role foncier. Utilisé aussi dans inventaire
export type ReponseCadastre = ApiResponse<FeatureCollection<Geometry,lotCadastralGeoJsonProperties>>
export type ReponseCadastreBoolInv = ApiResponse<FeatureCollection<Geometry,lotCadastralAvecBoolInvGeoJsonProperties>>
export type ReponseRole = ApiResponse<FeatureCollection<Geometry,roleFoncierGeoJsonProps>>
export type ReponseDBCadastre = ApiResponse<lotCadastralDB[]>
export type ReponseDBCadastreBoolInv = ApiResponse<lotCadastralBoolInvDB[]>
export type ReponseDBRole = ApiResponse<roleFoncierDB[]>
export type ReponseDBCadastreGeoSeul = ApiResponse<lotCadastralGeomSeulDb[]>
// types pour estimation inventaire
export type ReponseComboERsRoleFoncier = ApiResponse<comboERRoleFoncier[]>
export type ReponseDBInfoInventaireReglementManuel = ApiResponse<informations_reglementaire_manuelle[]>
// types pour analyse
export type ReponseDBInventaireAgregQuartTotal = ApiResponse<StatTotalDBAnaQuartier[]>
export type ReponseDBVariableAgregQuart = ApiResponse<VariableCartoDBAnaQuartier[]>
export type ReponseInventaireAgregQuartTotal = ApiResponse<FeatureCollection<Geometry,GeoJSONPropsAnaQuartierTotal>>
export type ReponseDBInventaireAgregQuartParHab = ApiResponse<StatTotalParHabDBAnaQuartier[]>
export type ReponseInventaireAgregQuartParHab = ApiResponse<FeatureCollection<Geometry,GeoJSONPropsAnaQuartierTotalParHab>>
export type ReponseDBInventaireAgregQuartParSuperf = ApiResponse<StatTotalParSuperfDBAnaQuartier[]>
export type ReponseInventaireAgregQuartParSuperf = ApiResponse<FeatureCollection<Geometry,GeoJSONPropsAnaQuartierTotalParSuperf>>
export type ReponsePAVQuartier = ApiResponse<PAVQuartier>
export type ReponsePAVNouveau = ApiResponse<entreePAV>
export type ReponseHistoAnalyse = ApiResponse<barChartDataSet>
export type ReponseXYAnalyseQuartier = ApiResponse<NhoodXYGraphDatasets>
// types pour analyse de règlements
export type ReponseUnitesGraph = ApiResponse<informations_pour_graph_unite_er_reg[]>
export type ReponseDataGraphique = ApiResponse<data_graphique>
// types pour analyse de variabilite
export type ReponseCalculComplete = ApiResponse<boolean>