import {ReponseCalculComplete, ReponseDataGraphique } from '../types/serviceTypes';
import api from './api';
import axios,{AxiosResponse} from 'axios';
import { data_graphique } from '../types/DataTypes';
export const serviceAnaVariabilite = {
    recalculeInventairesFonciersAvecTousEnsRegs:async() :Promise<boolean>=>{
        try {
            const response: AxiosResponse<ReponseCalculComplete> = await api.get(`/ana-variabilite/recalcule-inventaires-tous-ens-regs`);
            return response.data.success??false;
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

    obtiensInventairesEnsRegs:async(ids:number[]):Promise<ReponseDataGraphique>=>{
        try {
            const response: AxiosResponse<ReponseDataGraphique> = await api.get(`/ana-variabilite/obtiens-donnees-varia/${ids.join(',')}`);
            return ({success:response.data.success,
                    data:response.data.data
            });
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
    }
};