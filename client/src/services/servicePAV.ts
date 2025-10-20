import { ReponseInventaire,ReponseDBInventaire, ReponseDBInventaireAgregQuartTotal, ReponseInventaireAgregQuartParHab, ReponseDBInventaireAgregQuartParSuperf, ReponseInventaireAgregQuartParSuperf, ReponsePAVQuartier, } from '../types/serviceTypes';
import api from './api';
import axios,{AxiosResponse} from 'axios';
import { FeatureCollection,Geometry,Feature } from 'geojson';
import { isNumberObject } from 'util/types';
import { ReponseInventaireAgregQuartTotal } from '../types/serviceTypes';
import { GeoJSONPropsAnaQuartier,  } from '../types/AnalysisTypes';
import { entreePAV } from '../types/DataTypes';

export const servicePAV = {
    obtientPAVQuartier: async(ordre:number[],quartier:number,type_pav:string,stat_comp:string) : Promise<ReponsePAVQuartier> => {
        try {
            const response: AxiosResponse<ReponsePAVQuartier> = await api.get(`/PAV?order=${ordre.join(",")}&id_quartier=${quartier}&type=${type_pav}&stat_type=${stat_comp}`);
            const data_res = response.data.data;
            console.log('Recu profile accumulation vehicule')
            return {success:response.data.success,data:data_res};
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                console.error('Axios Error:', error.response?.data);
                console.error('Axios Error Status:', error.response?.status);
                console.error('Axios Error Data:', error.response?.data);
            } else {
                console.error('Unexpected Error:', error);
            }
            throw error; // Re-throw if necessary
        }
    },

    recalculePAVQuartier: async(quartier:number) : Promise<ReponsePAVQuartier> => {
        try {
            const response: AxiosResponse<ReponsePAVQuartier> = await api.get(`/PAV/recalcule/${quartier}`);
            const data_res = response.data.data;
            console.log('Recu statistiques quartier')
            return {success:response.data.success,data:data_res};
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                console.error('Axios Error:', error.response?.data);
                console.error('Axios Error Status:', error.response?.status);
                console.error('Axios Error Data:', error.response?.data);
            } else {
                console.error('Unexpected Error:', error);
            }
            throw error; // Re-throw if necessary
        }
    },
    sauvegardePAV:async(id_quartier:number,PAV:entreePAV[]):Promise<boolean>=>{
        try {
            const reponseMAJInv = await api.post(`/PAV/${id_quartier}`,PAV);
            return reponseMAJInv.data.success

        } catch (error:any) {
            if (axios.isAxiosError(error)) {
                console.error('Axios Error:', error.response?.data);
                console.error('Axios Error Status:', error.response?.status);
                console.error('Axios Error Data:', error.response?.data);
            } else {
                console.error('Unexpected Error:', error);
            }
            throw error; // Re-throw if necessary
        }
    }
};