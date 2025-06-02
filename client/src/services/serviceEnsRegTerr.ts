import { ReponseAssoTerritoireEnteteEnsembleRegleement } from "../types/serviceTypes";
import axios,{ AxiosResponse } from 'axios';
import api from './api';
class ServiceEnsRegTerr{
    async obtiensEnsRegEtAssocParTerritoire(idPeriodeGeo:number):Promise<ReponseAssoTerritoireEnteteEnsembleRegleement>{
        try{
            const response: AxiosResponse<ReponseAssoTerritoireEnteteEnsembleRegleement>= await api.get(`/ens-reg-terr/par-territoire/${idPeriodeGeo}`)
            const data_res = response.data.data
            return{success:response.data.success,data:data_res}
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

export const serviceEnsRegTerr =  new ServiceEnsRegTerr();