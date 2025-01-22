import axios,{ AxiosResponse } from 'axios';
import {ReponseEnsembleReglementComplet, ReponseEntetesEnsemblesReglement, ReponseEntetesReglements, } from '../types/serviceTypes';
import api from './api';


class ServiceEnsemblesReglements {
    async chercheTousEntetesEnsemblesReglements():Promise<ReponseEntetesEnsemblesReglement> {
        try {
            const response: AxiosResponse<ReponseEntetesEnsemblesReglement> = await api.get(`/ens-reg/entete`);
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

    async chercheEnsembleReglementParId(id:number):Promise<ReponseEnsembleReglementComplet> {
        try{
            const response:AxiosResponse<ReponseEnsembleReglementComplet>= await api.get(`/ens-reg/complet/${id}`);
            const data_res = response.data.data;
            return{success:response.data.success,data:data_res};
        } catch(error){
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

    async chercheReglementsPourEnsReg(id:number):Promise<ReponseEntetesReglements>{
        try{
            const response: AxiosResponse<ReponseEntetesReglements>= await api.get(`/ens-reg/regs-associes/${id}`)
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

export const serviceEnsemblesReglements =  new ServiceEnsemblesReglements();