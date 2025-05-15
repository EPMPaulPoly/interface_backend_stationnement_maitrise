
import { ReponsePeriode } from '../types/serviceTypes';
import { periode } from '../types/DataTypes';
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
    nouvellePeriode: async(nouvellePeriode:Omit<periode,'id_periode'>):Promise<ReponsePeriode>=>{
        try{
            const dbData: Partial<periode> = {
                            nom_periode: nouvellePeriode.nom_periode ,
                            date_debut_periode: nouvellePeriode.date_debut_periode,
                            date_fin_periode: nouvellePeriode.date_fin_periode
                            };
            const response:AxiosResponse<ReponsePeriode>=await api.put(`/historique`,dbData)
            console.log(`Création nouvel historique ${nouvellePeriode.nom_periode} de ${nouvellePeriode.date_debut_periode} à ${nouvellePeriode.date_fin_periode!==null?nouvellePeriode.date_fin_periode:'Présent'}`)
            return{success:response.data.success,data:response.data.data}
        }catch(error:any){
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
    majPeriode:async(idPeriode:number|null,periodeAMaj:periode):Promise<ReponsePeriode>=>{
        try {
            if (!isNaN(Number(idPeriode))){
                const dbData: Partial<periode> = {
                    nom_periode: periodeAMaj.nom_periode,
                    date_debut_periode: periodeAMaj.date_debut_periode,
                    date_fin_periode: periodeAMaj.date_fin_periode
                  };
                const reponseMAJInv = await api.post(`/historique/${idPeriode}`,dbData);
                return {success:reponseMAJInv.data.success,data:reponseMAJInv.data.data}
            } else{
                throw new Error("id_inv doit être défini pour cette fonction");
            }
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
    },
    supprimePeriode:async(idPeriode:number):Promise<boolean>=>{
        try {
            if (!isNaN(Number(idPeriode))){
                const reponseMAJInv = await api.delete(`/historique/${idPeriode}`);
                return reponseMAJInv.data.success
            } else{
                throw new Error("id_inv doit être défini pour cette fonction");
            }
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