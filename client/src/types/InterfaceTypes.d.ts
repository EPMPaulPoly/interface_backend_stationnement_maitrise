import {LatLng, LatLngExpression} from "leaflet";
import { SetStateAction } from "react";
import { inventaire_stationnement,quartiers_analyse, territoire,entete_reglement_stationnement,definition_reglement_stationnement, reglement_complet, entete_ensemble_reglement_stationnement, ensemble_reglements_stationnement, inventaireGeoJSONProps, lotCadastralGeoJsonProperties,roleFoncierGeoJsonProps, territoireGeoJsonProperties, lotCadastralAvecBoolInvGeoJsonProperties, informations_reglementaire_manuelle, utilisation_sol, data_graphique } from "./DataTypes";
import { FeatureCollection, Geometry } from "geojson";
import { PrioriteEstimeQuartier, TypesVisualisationAnalyseQuartier, VariablesPossibles } from "./AnalysisTypes";
import { N } from "react-router/dist/development/register-BkDIKxVz";
// --------------------------------------------------------------------------
// ------------------------- Interface --------------------------------------
// --------------------------------------------------------------------------
export interface study_area{
    name: string;
    x: number;
    y: number;
    zoom: number;
}

export interface load_state{
    state: boolean,
    set_load_state: SetStateAction<boolean>,
}

export interface error_state{
    state:boolean,
    set_error_state: SetStateAction<boolean>
}

export interface Utilisateur{
    name:string|null,
    hash:string|null,
    role:1|2|undefined
}

export interface role_set_state{
    state:boolean,
    set_role_set_state:SetStateAction<boolean>
}

// ---------------------------------------------------------------
// --------------------------- Inventaire ------------------------
// ---------------------------------------------------------------
export interface TableInventaireProps{
    quartier: number;
    defQuartier:  React.Dispatch<SetStateAction<number>>;
    optionsQuartiers: quartiers_analyse[];
    defOptionsQuartiers: React.Dispatch<SetStateAction<quartiers_analyse[]>>;
    inventaire: inventaire_stationnement[];
    defInventaire: React.Dispatch<SetStateAction<inventaire_stationnement[]>>
    lots:GeoJSON.Feature<GeoJSON.Geometry,lotCadastralAvecBoolInvGeoJsonProperties>,
    defLots: React.Dispatch<SetStateAction<GeoJSON.Feature<GeoJSON.Geometry,lotCadastralAvecBoolInvGeoJsonProperties>>>,
    donneesRole: GeoJSON.FeatureCollection<GeoJSON.Geometry,roleFoncierGeoJsonProperties>,
    defDonneesRole: React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,roleFoncierGeoJsonProperties>>>,
    ensemblesReglements:ensemble_reglements_stationnement[],
    defEnsemblesReglements: React.Dispatch<SetStateAction<ensemble_reglements_stationnement[]>>,
    reglements: reglement_complet[],
    defReglements: React.Dispatch<SetStateAction<reglement_complet[]>>,
    itemSelect: inventaire_stationnement[];
    defItemSelect :React.Dispatch<SetStateAction<inventaire_stationnement[]>>,
    methodeEstimeRegard:number,
    defMethodeEstimeRegard:React.Dispatch<SetStateAction<number>>,
    regRegard:number,
    defRegRegard:React.Dispatch<SetStateAction<number>>,
    ensRegRegard:number,
    defEnsRegRegard:React.Dispatch<SetStateAction<number>>,
    roleRegard:string,
    defRoleRegard:React.Dispatch<SetStateAction<string>>,
    lotsDuQuartier: GeoJSON.FeatureCollection<Geometry,lotCadastralAvecBoolInvGeoJsonProperties>,
    quartierSelect:number,
}

export interface CarteInventaireProps{
    lotsDuQuartier:GeoJSON.FeatureCollection<GeoJSON.Geometry,lotCadastralAvecBoolInvGeoJsonProperties>,
    defLotsDuQuartiers:  React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,lotCadastralAvecBoolInvGeoJsonProperties>>>,
    inventaire:inventaire_stationnement[];
    defInventaire: React.Dispatch<SetStateAction<inventaire_stationnement[]>>;
    itemSelect: inventaire_stationnement[];
    defItemSelect :React.Dispatch<SetStateAction<inventaire_stationnement[]>>,
    startPosition: LatLngExpression;
    setStartPosition:React.Dispatch<SetStateAction<LatLngExpression>>;
    startZoom: number;
    setStartZoom: React.Dispatch<SetStateAction<number>>;
    lotSelect:GeoJSON.Feature<GeoJSON.Geometry,lotCadastralAvecBoolInvGeoJsonProperties>,
    defLotSelect: React.Dispatch<SetStateAction<GeoJSON.Feature<GeoJSON.Geometry,lotCadastralAvecBoolInvGeoJsonProperties>>>,
    donneesRole: GeoJSON.FeatureCollection<GeoJSON.Geometry,roleFoncierGeoJsonProperties>,
    defDonneesRole: React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,roleFoncierGeoJsonProperties>>>,
    ensemblesReglements:ensemble_reglements_stationnement[],
    defEnsemblesReglements: React.Dispatch<SetStateAction<ensemble_reglements_stationnement[]>>,
    reglements: reglement_complet[],
    defReglements: React.Dispatch<SetStateAction<reglement_complet[]>>,
    methodeEstimeRegard:number,
    defMethodeEstimeRegard:React.Dispatch<SetStateAction<number>>,
    regRegard:number,
    defRegRegard:React.Dispatch<SetStateAction<number>>,
    ensRegRegard:number,
    defEnsRegRegard:React.Dispatch<SetStateAction<number>>,
    roleRegard:string,
    defRoleRegard:React.Dispatch<SetStateAction<string>>,
    montrerTousLots:boolean,
    optionCouleur:number,
    defOptionCouleur:React.Dispatch<SetStateAction<number>>,
}

export interface TableRevueProps{
    lots:GeoJSON.Feature<GeoJSON.Geometry,lotCadastralAvecBoolInvGeoJsonProperties>,
    defLots: React.Dispatch<SetStateAction<GeoJSON.Feature<GeoJSON.Geometry,lotCadastralAvecBoolInvGeoJsonProperties>>>,
    donneesRole: GeoJSON.FeatureCollection<GeoJSON.Geometry,roleFoncierGeoJsonProperties>,
    defDonneesRole: React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,roleFoncierGeoJsonProperties>>>,
    ensemblesReglements:ensemble_reglements_stationnement[],
    defEnsemblesReglements: React.Dispatch<SetStateAction<ensemble_reglements_stationnement[]>>,
    reglements: reglement_complet[],
    defReglements: React.Dispatch<SetStateAction<reglement_complet[]>>
    inventaire: inventaire_stationnement[],
    defInventaire: React.Dispatch<SetStateAction<inventaire_stationnement[]>>
    methodeEstimeRegard:number,
    defMethodeEstimeRegard:React.Dispatch<SetStateAction<number>>,
    regRegard:number,
    defRegRegard:React.Dispatch<SetStateAction<number>>,
    ensRegRegard:number,
    defEnsRegRegard:React.Dispatch<SetStateAction<number>>,
    roleRegard:string,
    defRoleRegard:React.Dispatch<SetStateAction<string>>,
    panneauModifVisible: boolean,
    defPanneauModifVisible:React.Dispatch<SetStateAction<boolean>>,
    quartier_select:number,
    defInventaireQuartier:React.Dispatch<SetStateAction<inventaire_stationnement[]>>
}



export interface TableauInventaireUniqueProps{
    inventaire: inventaire_stationnement
}



export interface ComparaisonInventaireQuartierProps{
    ancienInventaireReg:inventaire_stationnement[],
    defAncienInventaireReg:React.Dispatch<SetStateAction<inventaire_stationnement[]>>,
    nouvelInventaireReg: inventaire_stationnement[],
    defNouvelInventaireReg: React.Dispatch<SetStateAction<inventaire_stationnement[]>>,
    validationInventaireQuartier:boolean,
    defValidationInventaireQuartier:React.Dispatch<SetStateAction<boolean>>
    chargement:boolean,
    defChargement:React.Dispatch<SetStateAction<boolean>>,
    quartierSelect:number,
    lotsDuQuartier:FeatureCollection<Geometry,lotCadastralAvecBoolInvGeoJsonProperties>,
    defLotsDuQuartier: React.Dispatch<SetStateAction<FeatureCollection<Geometry,lotCadastralAvecBoolInvGeoJsonProperties>>>,
    defPanneauComparInventaireQuartierVis:React.Dispatch<SetStateAction<boolean>>;
}

export interface MenuInventaireProps{
    lotsDuQuartier: FeatureCollection<Geometry,lotCadastralAvecBoolInvGeoJsonProperties>,
    defLotsDuQuartier: React.Dispatch<SetStateAction<FeatureCollection<Geometry,lotCadastralAvecBoolInvGeoJsonProperties>>>,
    nouvelInventaireReg: inventaire_stationnement[],
    defNouvelInventaireReg: React.Dispatch<SetStateAction<inventaire_stationnement[],>>,
    inventaireActuel: inventaire_stationnement[],
    defInventaireActuel: React.Dispatch<SetStateAction<inventaire_stationnement[]>>,
    positionDepart: LatLngExpression;
    defPositionDepart:React.Dispatch<SetStateAction<LatLngExpression>>;
    zoomDepart: number;
    defZoomDepart: React.Dispatch<SetStateAction<number>>;
    optionsQuartier:quartiers_analyse[];
    quartier:number,
    defQuartier:React.Dispatch<SetStateAction<number>>;
    defPanneauComparInventaireQuartierVis:React.Dispatch<SetStateAction<boolean>>;
    defNouvelInventaireQuartier:React.Dispatch<SetStateAction<inventaire_stationnement[]>>;
    chargement:boolean,
    defChargement:React.Dispatch<SetStateAction<boolean>>
    montrerTousLots:boolean,
    defMontrerTousLots:React.Dispatch<SetStateAction<boolean>>,
    optionCouleur:number,
    defOptionCouleur:React.Dispatch<SetStateAction<number>>,
}

export interface PropsInformationReglementaireManuelle{
    defInformationRegManuel:React.Dispatch<SetStateAction<informations_reglementaire_manuelle[]>>
}
// ------------------------------------------------------------------------------
// ---------------------------- Historique --------------------------------------
// ------------------------------------------------------------------------------
export interface CarteHistoriqueProps{
    territoires:GeoJSON.FeatureCollection<GeoJSON.Geometry>;
    defTerritoires: React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,territoireGeoJsonProperties>>>;
    territoireSelect: number;
    defTerritoireSelect: React.Dispatch<SetStateAction<number>>;
    startPosition: LatLngExpression;
    setStartPosition:React.Dispatch<SetStateAction<LatLngExpression>>;
    startZoom: number;
    setStartZoom: React.Dispatch<SetStateAction<number>>;
}

export interface TableHistoireProps{
    periodeSelect:number,
    defPeriodeSelect:React.Dispatch<SetStateAction<number>>;
    territoires:GeoJSON.FeatureCollection<GeoJSON.Geometry>;
    defTerritoires: React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,territoireGeoJsonProperties>>>;
}

export interface TableTerritoireProps{
    territoires:GeoJSON.FeatureCollection<GeoJSON.Geometry>;
    defTerritoire:React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,territoireGeoJsonProperties>>>;
}

// ---------------------------------------------------------------------------
// ------------------------------ reglements ---------------------------------
// ---------------------------------------------------------------------------

export interface TableEnteteProps{
    entetes:entete_reglement_stationnement[],
    defEntetes:React.Dispatch<SetStateAction<entete_reglement_stationnement[]>>
    charge:boolean,
    defCharge:React.Dispatch<SetStateAction<boolean>>
    regSelect:reglement_complet,
    defRegSelect:React.Dispatch<SetStateAction<reglement_complet>>
    creationEnCours:boolean
    defCreationEnCours:React.Dispatch<SetStateAction<boolean>>
    editionEnteteEnCours:boolean
    defEditionEnteteEnCours:React.Dispatch<SetStateAction<boolean>>
    editionCorpsEnCours:boolean
    defEditionCorpsEnCours:React.Dispatch<SetStateAction<boolean>>
    modalOuvert:boolean
    defModalOuvert:React.Dispatch<SetStateAction<boolean>>
    toutesEntetes:entete_reglement_stationnement[]
    defToutesEntetes:React.Dispatch<SetStateAction<entete_reglement_stationnement[]>>
}

export interface TableVisModRegProps{
    charge:boolean,
    defCharge:React.Dispatch<SetStateAction<boolean>>
    regSelect:reglement_complet,
    defRegSelect:React.Dispatch<SetStateAction<reglement_complet>>
    creationEnCours:boolean
    defCreationEnCours:React.Dispatch<SetStateAction<boolean>>
    editionEnteteEnCours:boolean
    defEditionEnteteEnCours:React.Dispatch<SetStateAction<boolean>>
    editionCorpsEnCours:boolean
    defEditionCorpsEnCours:React.Dispatch<SetStateAction<boolean>>
    entetesRegStationnement:entete_reglement_stationnement[],
    defEntetesRegStationnement:React.Dispatch<SetStateAction<entete_reglement_stationnement[]>>
}


export interface FiltreReglementProps{
    resultatReglements:entete_reglement_stationnement[]
    defResultatReglements:React.Dispatch<SetStateAction<entete_reglement_stationnement[]>>
    tousReglements:entete_reglement_stationnement[]
    defTousReglement:React.Dispatch<SetStateAction<entete_reglement_stationnement[]>>
    anneeDebutDefaut?:number
    anneeFinDefaut?:number
}
export interface ModalFiltrageReglementProps{
    modalOuvert:boolean,
    defModalOuvert:React.Dispatch<SetStateAction<boolean>>
    tousReglements:entete_reglement_stationnement[]
    defTousReglement:React.Dispatch<SetStateAction<entete_reglement_stationnement[]>>
    reglementVisu:entete_reglement_stationnement[]
    defReglementVisu:React.Dispatch<SetStateAction<entete_reglement_stationnement[]>>
}
//-----------------------------------------------------------------------------
// ----------------------------- Ensembles Reglements -------------------------
// ---------------------------------------------------------------------------- 

export interface TableEnteteEnsembleProps{
    entetesEnsembles:entete_ensemble_reglement_stationnement[],
    defEntetesEnsembles:React.Dispatch<SetStateAction<entete_ensembles_reglement_stationnement[]>>
    ensembleReglement: ensemble_reglements_stationnement,
    defEnsembleReglement: React.Dispatch<SetStateAction<ensemble_reglements_stationnement>>,
    entetesReglements:entete_reglement_stationnement[],
    defEntetesReglements: React.Dispatch<SetStateAction<entete_reglement_stationnement[]>>
    editionEnteteEnCours:boolean,
    defEditionEnteteEnCours:React.Dispatch<SetStateAction<boolean>>,
    editionCorpsEnCours:boolean,
    defEditionCorpsEnCours:React.Dispatch<SetStateAction<boolean>>,
    ancienEnsRegComplet:ensemble_reglements_stationnement,
    defAncienEnsRegComplet:React.Dispatch<SetStateAction<ensemble_reglements_stationnement>>
}

export interface TableVisModEnsRegProps{
    charge:boolean,
    defCharge:React.Dispatch<SetStateAction<boolean>>
    ensembleReglement: ensemble_reglements_stationnement,
    defEnsembleReglement: React.Dispatch<SetStateAction<ensemble_reglements_stationnement>>,
    entetesReglements:entete_reglement_stationnement[],
    defEntetesReglements: React.Dispatch<SetStateAction<entete_reglement_stationnement[]>>,
    editionEnteteEnCours:boolean,
    defEditionEnteteEnCours: React.Dispatch<SetStateAction<boolean>>,
    editionCorpsEnCours:boolean,
    defEditionCorpsEnCours:React.Dispatch<SetStateAction<boolean>>,
    idAssociationEnEdition:number,
    defIdAssociationEnEdition:React.Dispatch<SetStateAction<number>>,
    entetesEnsRegListe: entete_ensemble_reglement_stationnement[],
    defEntetesEnsRegListe: React.Dispatch<SetStateAction<entete_ensemble_reglement_stationnement[]>>,
    ancienEnsRegComplet:ensemble_reglements_stationnement,
    defAncienEnsRegComplet:React.Dispatch<SetStateAction<ensemble_reglements_stationnement>>
    modalOuvert:boolean,
    defModalOuvert:React.Dispatch<SetStateAction<boolean>>
}
export interface creationAssocCubfErRegStat {
    ensembleReglement: ensemble_reglements_stationnement,
    defEnsembleReglement: React.Dispatch<SetStateAction<ensemble_reglements_stationnement>>,
    editionEnteteEnCours:boolean,
    defEditionEnteteEnCours: React.Dispatch<SetStateAction<boolean>>,
    editionCorpsEnCours:boolean,
    defEditionCorpsEnCours:React.Dispatch<SetStateAction<boolean>>,
    idAssociationEnEdition:number,
    defIdAssociationEnEdition:React.Dispatch<SetStateAction<number>>,
    ancienEnsRegComplet:ensemble_reglements_stationnement,
    defAncienEnsRegComplet:React.Dispatch<SetStateAction<ensemble_reglements_stationnement>>
    modalOuvert:boolean,
    defModalOuvert:React.Dispatch<SetStateAction<boolean>>
    tousReglements:entete_reglement_stationnement[]
    defTousReglement:React.Dispatch<SetStateAction<entete_reglement_stationnement[]>>
    reglementVisu:entete_reglement_stationnement[]
    defReglementVisu:React.Dispatch<SetStateAction<entete_reglement_stationnement[]>>
}

export interface VisResultatFiltre{
    reglementsPossible:entete_reglement_stationnement[],
    defReglementPossible:React.Dispatch<SetStateAction<entete_reglement_stationnement[]>>
    reglementAAssocier:entete_reglement_stationnement|null
    defReglementAssocier:React.Dispatch<SetStateAction<entete_reglement_stationnement|null>>
}
// ----------------------------------------------------------------------------
// -------------------- Ensembles Reglements - Territoires --------------------
// ---------------------------------------------------------------------------- 

export interface EnsRegTerrControlProps{
    periodesDispo:periode[],
    defPeriodesDispo:React.Dispatch<SetStateAction<periode[]>>,
    periodeSelect:periode,
    defPeriodeSelect:React.Dispatch<SetStateAction<periode>>,
    territoiresDispo: GeoJSON.FeatureCollection<GeoJSON.Geometry,territoireGeoJsonProperties>,
    defTerritoireDispo: React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,territoireGeoJsonProperties>>>,
    territoireSelect: GeoJSON.FeatureCollection<GeoJSON.Geometry,territoireGeoJsonProperties>,
    defTerritoireSelect: React.Dispatch<SetStateActionGeoJSON.FeatureCollection<GeoJSON.Geometry,territoireGeoJsonProperties>>,
    ensRegDispo:entete_ensemble_reglement_stationnement[],
    defEnsRegDispo:React.Dispatch<SetStateAction<entete_ensemble_reglement_stationnement[]>>,
    anneesVisu:number[],
    defAnneesVisu:React.Dispatch<SetStateAction<number[]>>
}

export interface EnsRegTerrDispTable{
    ensRegDispo:entete_ensemble_reglement_stationnement[],
    defEnsRegDispo:React.Dispatch<SetStateAction<entete_ensemble_reglement_stationnement[]>>,
    periodeSelect:periode,
    defPeriodeSelect:React.Dispatch<SetStateAction<periode>>,
    territoireSelect:GeoJSON.FeatureCollection<GeoJSON.Geometry,territoireGeoJsonProperties>,
}

export interface CarteEnsRegTerrProps{
    territoireSelect: GeoJSON.FeatureCollection<GeoJSON.Geometry,territoireGeoJsonProperties>,
    defTerritoireSelect: React.Dispatch<SetStateActionGeoJSON.FeatureCollection<GeoJSON.Geometry,territoireGeoJsonProperties>>
    centre: LatLngExpression;
    defCentre: React.Dispatch<SetStateAction<LatLngExpression>>
    zoom: number,
    defZoom:React.Dispatch<SetStateAction<number>>
}

// ----------------------------------------------------------------------------
// -------------------- Graphiques Comparaison Règlements ---------------------
// ---------------------------------------------------------------------------- 

export interface GraphiqueProps{
    listeReglements:number[],
    defListeReglements:React.Dispatch<SetStateAction<number[]>>
}

// ----------------------------------------------------------------------------
// -------------------- Graphiques Comparaison Quartiers ---------------------
// ---------------------------------------------------------------------------- 

export interface MenuCompQuartiersProps{
    methodeAnalyse:number,
    defMethodeAnalyse:React.Dispatch<SetStateAction<number>>,
    methodesPossibles:TypesVisualisationAnalyseQuartier[],
    prioriteInventaire:number,
    defPrioriteInventaire:React.Dispatch<SetStateAction<number>>,
    prioriteInventairePossibles:PrioriteEstimeQuartier[],
    defCalculEnCours:React.Dispacth<SetStateAction<boolean>>
}

export interface AnalyseCartoQuartierProps{
    prioriteInventaire:number,
    prioriteInventairePossibles:PrioriteEstimeQuartier[],
    variablesPossibles: VariablesPossibles[]
}

export interface AnalysePAVQuartierProps{
    prioriteInventaire:number,
    prioriteInventairePossibles:PrioriteEstimeQuartier[]
}

export interface AnalyseHistoQuartierProps{
    prioriteInventaire:number,
    prioriteInventairePossibles:PrioriteEstimeQuartier[],
    variablesPossibles: VariablesPossibles[]
}

export interface AnalyseXYQuartierProps{
    prioriteInventaire:number,
    prioriteInventairePossibles:PrioriteEstimeQuartier[],
    variablesPossibles: VariablesPossibles[]
}

// ----------------------------------------------------------------------------
// -------------------- Graphiques Comparaison Règlements ---------------------
// ---------------------------------------------------------------------------- 

export interface GraphiqueReglementsProps{
    ensRegSelectionnesHaut:number[],
    index:number,
    colorPalette:string[]
}

export interface PropsModalManipGraphiqueReg{
    modalOuvert:boolean,
    defModalOuvert:React.Dispatch<SetStateAction<boolean>>,
    CUBFSelect:utilisation_sol,
    defCUBFSelect:React.Dispatch<SetStateAction<utilisation_sol>>
    ensRegAVis:number[]
    data:data_graphique,
    defData: React.Dispatch<SetStateAction<data_graphique>>
    defLabelAxeX:React.Dispatch<SetStateAction<string>>
    regDispo:informations_pour_graph_unite_er_reg[]
    defRegDispo: React.Dispatch<SetStateAction<informations_pour_graph_unite_er_reg[]>>
    EnsRegSelect:number[]
    defEnsRegSelect:React.Dispatch<SetStateAction<number[]>>
    nUnites: number,
    defNUnites: React.Dispatch<SetStateAction<number>>
    minGraph: number
    defMinGraph:React.Dispatch<SetStateAction<number>>
    maxGraph:number,
    defMaxGraph: React.Dispatch<SetStateAction<number>>
    pasGraph:number
    defPasGraph:React.Dispatch<SetStateAction<number>>
    uniteGraph:number
    defUniteGraph:React.Dispatch<SetStateAction<number>>
}
export interface ControlAnaRegProps{
    ensRegSelectionnesHaut:number[],
    defEnsRegSelectionnesHaut:React.Dispatch<SetStateAction<number[]>>
    nGraphiques:number,
    defNGraphiques:React.Dispatch<SetStateAction<number>>
    colorPalette:string[]
}