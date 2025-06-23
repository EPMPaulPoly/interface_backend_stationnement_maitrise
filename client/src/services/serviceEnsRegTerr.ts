import { ReponseAssosTerritoireEnteteEnsembleReglement, ReponseAssoTerritoireEnsembleReglement } from "../types/serviceTypes";
import axios,{ Axios, AxiosResponse } from 'axios';
import api from './api';
import { associaion_territoire_ensemble_reglement } from "../types/DataTypes";
class ServiceEnsRegTerr{
    async obtiensEnsRegEtAssocParTerritoire(idPeriodeGeo:number):Promise<ReponseAssosTerritoireEnteteEnsembleReglement>{
        try{
            const response: AxiosResponse<ReponseAssosTerritoireEnteteEnsembleReglement>= await api.get(`/ens-reg-terr/par-territoire/${idPeriodeGeo}`)
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
    async nouvelleAssociationRegSetTer(associationASauvegarder:Omit<associaion_territoire_ensemble_reglement,'id_asso_er_ter'>):Promise<ReponseAssoTerritoireEnsembleReglement>{
        try{
            const dbData:Omit<associaion_territoire_ensemble_reglement,'id_asso_er_ter'>={
                id_er:associationASauvegarder.id_er,
                id_periode_geo:associationASauvegarder.id_periode_geo
            }
            const response:AxiosResponse<ReponseAssoTerritoireEnsembleReglement> = await api.post('/ens-reg-terr/association',dbData)
            return {success:response.data.success,data:response.data.data}
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
    async modifieAssociationRegSetTerr(idASauvegarder:number,associationASauvegarder:Omit<associaion_territoire_ensemble_reglement,'id_asso_er_ter'>):Promise<ReponseAssoTerritoireEnsembleReglement>{
        try{
            const dbData:Omit<associaion_territoire_ensemble_reglement,'id_asso_er_ter'>={
                id_er:associationASauvegarder.id_er,
                id_periode_geo:associationASauvegarder.id_periode_geo
            }
            const response:AxiosResponse<ReponseAssoTerritoireEnsembleReglement> = await api.put(`/ens-reg-terr/association/${idASauvegarder}`,dbData)
            return {success:response.data.success,data:response.data.data}
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
    async supprimeAssociationRegSetTerr(idASupprimer:number):Promise<boolean>{
        try{

            const response:AxiosResponse<ReponseAssoTerritoireEnsembleReglement> = await api.delete(`/ens-reg-terr/association/${idASupprimer}`)
            let output;
            if (response.data.success){
                output = true;
            }else{
                output= false;
            }
            return output
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
    async obtiensEnsRegEtAssocParLatLong(Lat:number,long:number):Promise<ReponseAssosTerritoireEnteteEnsembleReglement>{
        try{
            const response:AxiosResponse<ReponseAssosTerritoireEnteteEnsembleReglement> = await api.get(`/ens-reg-terr/associations?lat=${Lat}&long=${long}`)
            return {success:response.data.success,data:response.data.data}
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