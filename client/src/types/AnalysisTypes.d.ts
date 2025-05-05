import Geometry from 'geojson';
// ----------------------------------------------------------------
// -------------------- UX et options -----------------------------
// ----------------------------------------------------------------

export interface TypesVisualisationAnalyseQuartier{
    idAnalyse:number,
    descriptionAnalyse:string,
}


export interface TypesAnalysesCartographiqueQuartier{
    idAnalyseCarto:number,
    descriptionAnalyseCarto:string,
}

export interface PrioriteEstimeInventaire{
    idPriorite:number,
    descriptionPriorite:string,
    listeMethodesOrdonnees:number[]
}

export interface VariablesPossibles{
    idVariable:number,
    descriptionVariable:string,
    requiertOrdrePriorite:boolean,
    queryKey:string
}

export interface VariablesPossiblesGraphiqueXY{
    idVariable:number,
    descriptionVariable:string,
    requiertOrdrePriorite:boolean,
    queryKey:string
}
export interface NhoodXYGraphDatasets{
    descriptionX:string,
    descriptionY:string,
    donnees:NhoodXYGraphEntry[]
}
export interface NhoodXYGraphEntry{
    id_quartier:number,
    nom_quartier:string,
    x:number,
    y:number
}
// ----------------------------------------------------------------
// -------------------------- Donnees -----------------------------
// ----------------------------------------------------------------

export interface GeoJSONPropsAnaQuartier{
    id_quartier:number,
    description:string,
    valeur:number,
    superficie_quartier:number,
    nom_quartier:string
}

export interface VariableCartoDBAnaQuartier extends GeoJSONPropsAnaQuartier{
    geojson_geometry: Geometry,
    superf_quartier:number
}

export interface StatTotalDBAnaQuartier extends GeoJSONPropsAnaQuartier{
    geojson_geometry: Geometry,
    superf_quartier:number
}

