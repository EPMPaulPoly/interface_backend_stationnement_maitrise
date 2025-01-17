import {periode,territoire,quartiers_analyse,inventaire_stationnement} from './DataTypes'

export interface ApiResponse<T> {
    success?: boolean;
    data: T;
    error?: string;
  }

export type ReponsePeriode = ApiResponse<periode[]>
export type ReponseTerritoire = ApiResponse<territoire[]>
export type ReponseQuartiersAnalyse = ApiResponse<quartiers_analyse[]>
export type ReponseInventaire = ApiResponse<inventaire_stationnement[]>