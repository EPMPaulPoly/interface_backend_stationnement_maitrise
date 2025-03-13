import {LatLng, LatLngExpression} from "leaflet";
import { SetStateAction } from "react";
import { inventaire_stationnement,quartiers_analyse, territoire,entete_reglement_stationnement,definition_reglement_stationnement, reglement_complet, entete_ensemble_reglement_stationnement, ensemble_reglements_stationnement, inventaireGeoJSONProps, lotCadastralGeoJsonProperties,roleFoncierGeoJsonProps, territoireGeoJsonProperties, lotCadastralAvecBoolInvGeoJsonProperties } from "./DataTypes";
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
    inventaire: inventaire_stationnement[];
    defInventaire: React.Dispatch<SetStateAction<inventaire_stationnement[]>>
    lots:GeoJSON.FeatureCollection<GeoJSON.Geometry,lotCadastralGeoJsonProperties>,
    defLots: React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,lotCadastralGeoJsonProperties>>>,
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
    lotSelect:GeoJSON.FeatureCollection<GeoJSON.Geometry,lotCadastralGeoJsonProperties>,
    defLotSelect: React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,lotCadastralGeoJsonProperties>>>,
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