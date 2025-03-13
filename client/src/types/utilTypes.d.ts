import {Dispatch,SetStateAction} from 'react';
import { inventaire_stationnement, lotCadastralAvecBoolInvGeoJsonProperties } from './DataTypes';
import { FeatureCollection, Geometry } from 'geojson';

export interface MAJLotsInventaireProps{
    defInventaire:Dispatch<SetStateAction<inventaire_stationnement[]>>,
    defLotsDuQuartier:Dispatch<SetStateAction<FeatureCollection<Geometry,lotCadastralAvecBoolInvGeoJsonProperties>>>
}

export interface calculateRegLotInventoryProps{
    lots:inventaire_stationnement[],
    modifEnMarche:boolean,
    defInventaireProp:React.Dispatch<SetStateAction<inventaire_stationnement>>
    defNvInvRegATrait:React.Dispatch<SetStateAction<boolean>>
}

export interface selectLotProps{
    lotAnalyse: GeoJSON.FeatureCollection<GeoJSON.Geometry,lotCadastralGeoJsonProperties>,
    defLotAnalyse: React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,lotCadastralGeoJsonProperties>>>,
    roleAnalyse:GeoJSON.FeatureCollection<GeoJSON.Geometry,roleFoncierGeoJsonProps>,
    defRoleAnalyse: React.Dispatch<SetStateAction<GeoJSON.FeatureCollection<GeoJSON.Geometry,roleFoncierGeoJsonProps>>>,
    inventaireAnalyse: inventaire_stationnement[],
    defInventaireAnalyse: React.Dispatch<SetStateAction<inventaire_stationnement[]>>,
    reglementsAnalyse: reglement_complet[],
    defReglementsAnalyse: React.Dispatch<SetStateAction<reglement_complet[]>>,
    ensemblesAnalyse: ensemble_reglements_stationnement[],
    defEnsemblesAnalyse: React.Dispatch<SetStateAction<ensemble_reglements_stationnement[]>>,
    numLot: string,
    inventaireComplet: inventaire_stationnement[],
    methodeEstimeRegard:number,
    defMethodeEstimeRegard:React.Dispatch<SetStateAction<number>>,
    regRegard:number,
    defRegRegard:React.Dispatch<SetStateAction<number>>,
    ensRegRegard:number,
    defEnsRegRegard:React.Dispatch<SetStateAction<number>>,
    roleRegard:string,
    defRoleRegard:React.Dispatch<SetStateAction<string>>,
    lotsDuQuartier: GeoJSON.FeatureCollection<Geometry,lotCadastralAvecBoolInvGeoJsonProperties>
}