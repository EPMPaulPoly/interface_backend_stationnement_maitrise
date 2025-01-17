import { ParamsDictionary } from 'express-serve-static-core';

export interface DbQuartierAnalyse{
    ID:number,
    NOM:string,
    SUPERFICIE:number,
    PERIMETRE:number,
    geometry: string;  // Geometry(Geometry,32187)
}