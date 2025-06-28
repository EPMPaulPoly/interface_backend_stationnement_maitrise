import {ReponseCalculComplete } from '../types/serviceTypes';
import api from './api';
import axios,{AxiosResponse} from 'axios';

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
    }
};