import { ReponseCalculComplete, ReponseDataGraphique } from '../types/serviceTypes';
import api from './api';
import axios, { AxiosResponse } from 'axios';
import { data_graphique } from '../types/DataTypes';
export const serviceAnaVariabilite = {
    recalculeInventairesFonciersAvecTousEnsRegs: async (): Promise<boolean> => {
        try {
            const response: AxiosResponse<ReponseCalculComplete> = await api.get(`/ana-var/recalcule-inventaires-tous-ens-regs`);
            return response.data.success ?? false;
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
    obtiensInventairesEnsRegs: async (ids: number[], idRef?: number, cubf_n1?: number): Promise<ReponseDataGraphique> => {
        try {
            let query_add: string[] = [];
            if (typeof idRef !== 'undefined') {
                query_add.push(`id_ref=${idRef}`)
            }
            if (typeof cubf_n1 !== 'undefined') {
                query_add.push(`cubf_n1=${cubf_n1}`)
            }
            let base_query: string = `/ana-var/obtiens-donnees-varia?id_er=${ids.join(',')}`
            if (query_add.length > 0) {
                base_query += '&' + query_add.join('&')
            }
            const response: AxiosResponse<ReponseDataGraphique> = await api.get(base_query);
            return ({
                success: response.data.success,
                data: response.data.data
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