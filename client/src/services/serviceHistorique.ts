
import { ReponsePeriode } from '../types/serviceTypes';
import api from './api';
import axios,{AxiosResponse} from 'axios';
export const serviceHistorique = {
    obtientTous: async() : Promise<ReponsePeriode> => {
        try {
            const response: AxiosResponse<ReponsePeriode> = await api.get(`/historique`);
            console.log('Recu historique')
            return {success:response.data.success,data:response.data.data};
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
};