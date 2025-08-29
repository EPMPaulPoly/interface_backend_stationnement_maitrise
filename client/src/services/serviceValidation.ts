import { RequeteApiStrate, Strate } from "../types/DataTypes";
import axios from 'axios';
import api from './api';
import { ReponseStrateUnique, ReponseStrateValide } from "../types/serviceTypes";
export const serviceValidation = {
    obtiensStrates:async(requeteApiStrate?:RequeteApiStrate):Promise<ReponseStrateValide>=>{
        try{
            let conditions:string[] = [];
            if (requeteApiStrate?.id_strate!==undefined && requeteApiStrate.id_strate!==null){
                conditions.push(`id_strate=${requeteApiStrate?.id_strate}`)
            }
            if (requeteApiStrate?.n_sample_ge!==undefined && requeteApiStrate.n_sample_ge!==null){
                conditions.push(`n_samples_ge=${requeteApiStrate?.n_sample_ge}`)
            }
            if (requeteApiStrate?.n_sample_se!==undefined && requeteApiStrate.n_sample_se!==null){
                conditions.push(`n_samples_se=${requeteApiStrate?.n_sample_se}`)
            }
            let query:string = '/valid/strate'
            if (conditions.length>0){
                query += '?'+conditions.join('&')
            }
            const output = await api.get(query)
            return {success:true,data:output.data.data};
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
    nouvelleStrate:async(strateAInserer:Strate,idParent:number|null):Promise<ReponseStrateValide>=>{
        try{
            let query_new:string = '/valid/strate'
            const { id_strate, ...rest } = strateAInserer;
            let body: Omit<Strate, 'id_strate'> = rest;
            const output = await api.post(query_new,{princip:body,id_parent:idParent});
            return {success:true,data:output.data.data};
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
    modifieStrate:async(idStrate:number,strateComplete:Strate)=>{
        try{
            let query_new:string = `/valid/strate/${idStrate}`
            const { id_strate, ...rest } = strateComplete;
            let body: Omit<Strate, 'id_strate'> = rest;
            const output = await api.put(query_new,body);
            return {success:true,data:output.data.data};
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
    supprimeStrate:async(idStrate:number):Promise<ReponseStrateValide>=>{
        try{
            let query_new:string = `/valid/strate/${idStrate}`
            const output = await api.delete(query_new);
            return {success:true,data:output.data.data};
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
}

export default serviceValidation;