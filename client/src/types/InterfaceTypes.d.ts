import {LatLng, LatLngExpression} from "leaflet";
import { SetStateAction } from "react";
import { inventaire_stationnement,quartiers_analyse, territoire,entete_reglement_stationnement,definition_reglement_stationnement, reglement_complet, entete_ensemble_reglement_stationnement, ensemble_reglements_stationnement, inventaireGeoJSONProps, lotCadastralGeoJsonProperties,roleFoncierGeoJsonProps } from "./DataTypes";
import { FeatureCollection } from "geojson";
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
}



export interface CarteInventaireProps{
    inventaire:GeoJSON.FeatureCollection<GeoJSON.Geometry,inventaireGeoJSONProps>;
    defInventaire: React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,territoireGeoJsonProperties>>>;
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
    defReglements: React.Dispatch<SetStateAction<reglement_complet[]>>
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

