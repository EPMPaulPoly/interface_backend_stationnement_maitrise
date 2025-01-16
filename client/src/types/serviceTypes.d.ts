import {periode,territoire} from './DataTypes'

export interface ApiResponse<T> {
    success?: boolean;
    data: T;
    error?: string;
  }

export type ReponsePeriode = ApiResponse<periode[]>
export type ReponseTerritoire = ApiResponse<territoire[]>