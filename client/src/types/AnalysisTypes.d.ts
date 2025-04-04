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

// ----------------------------------------------------------------
// -------------------------- Donnees -----------------------------
// ----------------------------------------------------------------

export interface GeoJSONPropsAnaQuartier{
    id_quartier:number,
    description:string,
    valeur:number,
    superficie_quartier:number,
}

export interface StatTotalDBAnaQuartier extends GeoJSONPropsAnaQuartier{
    geojson_geometry: Geometry,
    superf_quartier:number
}