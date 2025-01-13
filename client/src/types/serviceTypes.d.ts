import periode from './DataTypes'

export interface ApiResponse<T> {
    success?: boolean;
    data: T;
    error?: string;
  }

export type ReponsePeriode = ApiResponse<periode[]>