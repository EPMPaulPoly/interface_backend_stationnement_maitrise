import {LatLng, LatLngExpression} from "leaflet";
import { SetStateAction } from "react";
import { inventaire_stationnement,quartiers_analyse, territoire,entete_reglement_stationnement,definition_reglement_stationnement, reglement_complet, entete_ensemble_reglement_stationnement, ensemble_reglements_stationnement, inventaireGeoJSONProps, lotCadastralGeoJsonProperties,roleFoncierGeoJsonProps, territoireGeoJsonProperties } from "./DataTypes";
import { FeatureCollection, Geometry } from "geojson";
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
    inventaire: GeoJSON.FeatureCollection<GeoJSON.Geometry,inventaireGeoJSONProps>;
    defInventaire: React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,inventaireGeoJSONProps>>>
    lots:GeoJSON.FeatureCollection<GeoJSON.Geometry,lotCadastralGeoJsonProperties>,
    defLots: React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,lotCadastralGeoJsonProperties>>>,
    donneesRole: GeoJSON.FeatureCollection<GeoJSON.Geometry,roleFoncierGeoJsonProperties>,
    defDonneesRole: React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,roleFoncierGeoJsonProperties>>>,
    ensemblesReglements:ensemble_reglements_stationnement[],
    defEnsemblesReglements: React.Dispatch<SetStateAction<ensemble_reglements_stationnement[]>>,
    reglements: reglement_complet[],
    defReglements: React.Dispatch<SetStateAction<reglement_complet[]>>,
    itemSelect: GeoJSON.FeatureCollection<GeoJSON.Geometry,inventaireGeoJSONProps>;
    defItemSelect :React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,inventaireGeoJSONProps>>>,
    methodeEstimeRegard:number,
    defMethodeEstimeRegard:React.Dispatch<SetStateAction<number>>,
    regRegard:number,
    defRegRegard:React.Dispatch<SetStateAction<number>>,
    ensRegRegard:number,
    defEnsRegRegard:React.Dispatch<SetStateAction<number>>,
    roleRegard:string,
    defRoleRegard:React.Dispatch<SetStateAction<string>>,
}

export interface CarteInventaireProps{
    inventaire:GeoJSON.FeatureCollection<GeoJSON.Geometry,inventaireGeoJSONProps>;
    defInventaire: React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,inventaireGeoJSONProps>>>;
    itemSelect: GeoJSON.FeatureCollection<GeoJSON.Geometry,inventaireGeoJSONProps>;
    defItemSelect :React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,inventaireGeoJSONProps>>>,
    startPosition: LatLngExpression;
    setStartPosition:React.Dispatch<SetStateAction<LatLngExpression>>;
    startZoom: number;
    setStartZoom: React.Dispatch<SetStateAction<number>>;
    lots:GeoJSON.FeatureCollection<GeoJSON.Geometry,lotCadastralGeoJsonProperties>,
    defLots: React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,lotCadastralGeoJsonProperties>>>,
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
}

export interface TableRevueProps{
    lots:GeoJSON.FeatureCollection<GeoJSON.Geometry,lotCadastralGeoJsonProperties>,
    defLots: React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,lotCadastralGeoJsonProperties>>>,
    donneesRole: GeoJSON.FeatureCollection<GeoJSON.Geometry,roleFoncierGeoJsonProperties>,
    defDonneesRole: React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,roleFoncierGeoJsonProperties>>>,
    ensemblesReglements:ensemble_reglements_stationnement[],
    defEnsemblesReglements: React.Dispatch<SetStateAction<ensemble_reglements_stationnement[]>>,
    reglements: reglement_complet[],
    defReglements: React.Dispatch<SetStateAction<reglement_complet[]>>
    inventaire: GeoJSON.FeatureCollection<GeoJSON.Geometry,inventaireGeoJSONProps>,
    defInventaire: React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,inventaireGeoJSONProps>>>
    methodeEstimeRegard:number,
    defMethodeEstimeRegard:React.Dispatch<SetStateAction<number>>,
    regRegard:number,
    defRegRegard:React.Dispatch<SetStateAction<number>>,
    ensRegRegard:number,
    defEnsRegRegard:React.Dispatch<SetStateAction<number>>,
    roleRegard:string,
    defRoleRegard:React.Dispatch<SetStateAction<string>>,
    panneauModifVisible: boolean,
    defPanneauModifVisible:React.Dispatch<SetStateAction<boolean>>
}

export interface selectLotProps{
    lotAnalyse: GeoJSON.FeatureCollection<GeoJSON.Geometry,lotCadastralGeoJsonProperties>,
    defLotAnalyse: React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,lotCadastralGeoJsonProperties>>>,
    roleAnalyse:GeoJSON.FeatureCollection<GeoJSON.Geometry,roleFoncierGeoJsonProps>,
    defRoleAnalyse: React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,roleFoncierGeoJsonProps>>>,
    inventaireAnalyse: GeoJSON.FeatureCollection<GeoJSON.Geometry,inventaireGeoJSONProps>,
    defInventaireAnalyse: React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,inventaireGeoJSONProps>>>,
    reglementsAnalyse: reglement_complet[],
    defReglementsAnalyse: React.Dispatch<SetStateAction<reglement_complet[]>>,
    ensemblesAnalyse: ensemble_reglements_stationnement[],
    defEnsemblesAnalyse: React.Dispatch<SetStateAction<ensemble_reglements_stationnement[]>>,
    numLot: string,
    inventaireComplet: GeoJSON.FeatureCollection<GeoJSON.Geometry,inventaireGeoJSONProps>
    methodeEstimeRegard:number,
    defMethodeEstimeRegard:React.Dispatch<SetStateAction<number>>,
    regRegard:number,
    defRegRegard:React.Dispatch<SetStateAction<number>>,
    ensRegRegard:number,
    defEnsRegRegard:React.Dispatch<SetStateAction<number>>,
    roleRegard:string,
    defRoleRegard:React.Dispatch<SetStateAction<string>>,
}

export interface TableauInventaireUniqueProps{
    inventaire: GeoJSON.Feature<Geometry|null,inventaireGeoJSONProps>
}

export interface calculateRegLotInventoryProps{
    lots:FeatureCollection<Geometry,inventaireGeoJSONProps>
    modifEnMarche:boolean,
    defInventaireProp:Feature<Geometry,inventaireGeoJSONProps>
    defNvInvRegATrait:React.Dispatch<SetStateAction<boolean>>
}

export interface ComparaisonInventaireQuartierProps{
    ancienInventaireReg:FeatureCollection<Geometry,inventaireGeoJSONProps>,
    defAncienInventaireReg:React.Dispatch<SetStateAction<FeatureCollection<Geometry,inventaireGeoJSONProps>>>,
    nouvelInventaireReg: FeatureCollection<Geometry,inventaireGeoJSONProps>,
    defNouvelInventaireReg: React.Dispatch<SetStateAction<FeatureCollection<Geometry,inventaireGeoJSONProps>>>,
    validationInventaireQuartier:boolean,
    defValidationInventaireQuartier:React.Dispatch<SetStateAction<boolean>>
    chargement:boolean,
    defChargement:React.Dispatch<SetStateAction<boolean>>
}

export interface MenuInventaireProps{
    nouvelInventaireReg: FeatureCollection<Geometry,inventaireGeoJSONProps>,
    defNouvelInventaireReg: React.Dispatch<SetStateAction<FeatureCollection<Geometry,inventaireGeoJSONProps>>>,
    inventaireActuel: FeatureCollection<Geometry,inventaireGeoJSONProps>,
    defInventaireActuel: React.Dispatch<SetStateAction<FeatureCollection<Geometry,inventaireGeoJSONProps>>>,
    positionDepart: LatLngExpression;
    defPositionDepart:React.Dispatch<SetStateAction<LatLngExpression>>;
    zoomDepart: number;
    defZoomDepart: React.Dispatch<SetStateAction<number>>;
    optionsQuartier:quartiers_analyse[];
    quartier:number,
    defQuartier:React.Dispatch<SetStateAction<number>>;
    defPanneauComparInventaireQuartierVis:React.Dispatch<SetStateAction<boolean>>;
    defNouvelInventaireQuartier:React.Dispatch<SetStateAction<FeatureCollection<Geometry,inventaireGeoJSONProps>>>;
    chargement:boolean,
    defChargement:React.Dispatch<SetStateAction<boolean>>
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
}

export interface TableVisModRegProps{
    charge:boolean,
    defCharge:React.Dispatch<SetStateAction<boolean>>
    regSelect:reglement_complet,
    defRegSelect:React.Dispatch<SetStateAction<reglement_complet>>
}

//-----------------------------------------------------------------------------
// ----------------------------- Ensembles Reglements -------------------------
// ---------------------------------------------------------------------------- 

export interface TableEnteteEnsembleProps{
    entetesEnsembles:entete_ensemble_reglement_stationnement[],
    defEntetesEnsembles:React.Dispatch<SetStateAction<entete_ensembles_reglement_stationnement[]>>
    ensembleReglement: ensemble_reglements_stationnement[],
    defEnsembleReglement: React.Dispatch<SetStateAction<ensemble_reglements_stationnement[]>>,
    entetesReglements:entete_reglement_stationnement[],
    defEntetesReglements: React.Dispatch<SetStateAction<entete_reglement_stationnement[]>>
}

export interface TableVisModEnsRegProps{
    charge:boolean,
    defCharge:React.Dispatch<SetStateAction<boolean>>
    ensembleReglement: ensemble_reglements_stationnement[],
    defEnsembleReglement: React.Dispatch<SetStateAction<ensemble_reglements_stationnement[]>>,
    entetesReglements:entete_reglement_stationnement[],
    defEntetesReglements: React.Dispatch<SetStateAction<entete_reglement_stationnement[]>>
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