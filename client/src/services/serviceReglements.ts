import axios,{ AxiosResponse } from 'axios';
import { entete_reglement_stationnement,  } from '../types/DataTypes';
import { ReponseEntetesReglements, ReponseReglementComplet,ReponseDBInfoInventaireReglementManuel} from '../types/serviceTypes';
import api from './api';
import { promises } from 'dns';

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

    async chercheReglementComplet(id:number|number[]):Promise<ReponseReglementComplet>{
        try {
            if (typeof(id)==='number'){
                const response: AxiosResponse<ReponseReglementComplet> = await api.get(`/reglements/complet/${id}`);
                const data_res = response.data.data;
                return {success:response.data.success,data:data_res};
            } else{
                const response: AxiosResponse<ReponseReglementComplet> = await api.get(`/reglements/complet/${id.join(',')}`);
                const data_res = response.data.data;
                return {success:response.data.success,data:data_res};
            }
            
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

    async obtiensUnitesReglementsParLot(id:string):Promise<ReponseDBInfoInventaireReglementManuel>{
        try{
            const parseId = id.replace(/ /g, "_");
            const response:AxiosResponse<ReponseDBInfoInventaireReglementManuel> = await api.get(`/reglements/unites/${parseId}`)
            return{success:response.data.success,data:response.data.data}
        }catch(error){
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