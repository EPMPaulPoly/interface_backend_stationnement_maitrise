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


export interface VariablesPossiblesGraphiqueXY{
    idVariable:number,
    descriptionVariable:string
}
export interface NhoodXYGraphDatasets{
    idX:number,
    descriptionX:string,
    idY:number,
    descriptionY:string,
    donnees:NhoodXYGraphEntry[]
}
export interface NhoodXYGraphEntry{
    id_quartier:number,
    nom_quartier:string,
    X:number,
    Y:number
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

export interface StatTotalDBAnaQuartier extends GeoJSONPropsAnaQuartier{
    geojson_geometry: Geometry,
    superf_quartier:number
}

