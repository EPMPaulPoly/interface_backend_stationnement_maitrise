
import { ReponseInventaire } from '../types/serviceTypes';
import api from './api';
import axios,{AxiosResponse} from 'axios';

export const serviceInventaire = {
    obtientInventaireParQuartier: async(id_quartier:number) : Promise<ReponseInventaire> => {
        try {
            const response: AxiosResponse<ReponseInventaire> = await api.get(`/inventaire/quartier/${id_quartier}`);
            console.log('Recu Invetaire')
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