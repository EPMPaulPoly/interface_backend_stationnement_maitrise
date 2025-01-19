import axios,{ AxiosResponse } from 'axios';
import { entete_reglement_stationnement,  } from '../types/DataTypes';
import { ReponseEntetesReglements} from '../types/serviceTypes';
import api from './api';

class ServiceReglements {
    async chercheTousEntetesReglements():Promise<ReponseEntetesReglements> {
        try {
            const response: AxiosResponse<ReponseEntetesReglements> = await api.get(`/reglements/entete`);
            const data_res = response.data.data;
            return {success:response.data.success,data:data_res};
        } catch (error) {
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
}

export const serviceReglements =  new ServiceReglements();