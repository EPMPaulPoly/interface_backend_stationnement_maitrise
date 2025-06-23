import axios,{ AxiosResponse } from 'axios';
import {ReponseEnteteEnsembleReglementStationnement,ReponseEnsembleReglementComplet, ReponseEntetesEnsemblesReglement, ReponseEntetesReglements, ReponseComboERsRoleFoncier, ReponseAssociationEnsembleReglement,ReponseUnitesGraph, ReponseDataGraphique} from '../types/serviceTypes';
import api from './api';
import { association_util_reglement, entete_ensembles_reglement_stationnement, ProprietesRequetesER } from '../types/DataTypes';


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

    async chercheEntetesParPropriete(paramsRequetes:ProprietesRequetesER):Promise<ReponseEntetesEnsemblesReglement>{
        try {
            let query:string = `/ens-reg/entete`
            let queryAdds = []
            
            if (typeof(paramsRequetes.dateDebutAvant)!=='undefined'){
                queryAdds.push(`date_debut_er_avant=${paramsRequetes.dateDebutAvant}`)
            }
            if (typeof(paramsRequetes.dateDebutApres)!=='undefined'){
                queryAdds.push(`date_debut_er_apres=${paramsRequetes.dateDebutApres}`)
            }
            if (typeof(paramsRequetes.dateFinAvant)!=='undefined'){
                queryAdds.push(`date_fin_er_avant=${paramsRequetes.dateFinAvant}`)
            }
            if (typeof(paramsRequetes.dateFinApres)!=='undefined'){
                queryAdds.push(`date_fin_er_apres=${paramsRequetes.dateFinApres}`)
            }
            if (typeof(paramsRequetes.descriptionLike)!=='undefined'){
                queryAdds.push(`description_like=${encodeURIComponent(paramsRequetes.descriptionLike)}`)
            }
            if (queryAdds.length>0){
                query+= '?'+queryAdds.join('&')
            }
            const response: AxiosResponse<ReponseEntetesEnsemblesReglement> = await api.get(query);
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

    async chercheEnsembleReglementParId(id:number|number[]):Promise<ReponseEnsembleReglementComplet> {
        try{
            const response:AxiosResponse<ReponseEnsembleReglementComplet>= await api.get(`/ens-reg/complet/${id}`);
            if (typeof(id)==='number'){
                const response:AxiosResponse<ReponseEnsembleReglementComplet>= await api.get(`/ens-reg/complet/${id}`);
                const data_res = response.data.data;
                return{success:response.data.success,data:data_res};
            } else{
                const response:AxiosResponse<ReponseEnsembleReglementComplet>= await api.get(`/ens-reg/complet/${id.join(',')}`);
                const data_res = response.data.data;
                return{success:response.data.success,data:data_res};
            }
            
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

    async obtiensEnsRegParTerritoire(idPeriodeGeo:number):Promise<ReponseEntetesEnsemblesReglement>{
        try{
            const response: AxiosResponse<ReponseEntetesEnsemblesReglement>= await api.get(`/ens-reg/entete-par-territoire/${idPeriodeGeo}`)
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

    async chercheEnsRegPourRole(ids:string[]):Promise<ReponseComboERsRoleFoncier>{
        try{
            const response: AxiosResponse<ReponseEntetesEnsemblesReglement>= await api.get(`/ens-reg/par-role/${ids.join(',')}`)
            const data_res = response.data.data
            return{success:response.data.success,data:[]}
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

    async nouvelleEntete (enteteASauver:Omit<entete_ensembles_reglement_stationnement,'id_er'>):Promise<ReponseEnteteEnsembleReglementStationnement>{
        try{
            const dbData:Omit<entete_ensembles_reglement_stationnement,'id_er'>={
                description_er:enteteASauver.description_er,
                date_debut_er:enteteASauver.date_debut_er,
                date_fin_er:enteteASauver.date_fin_er
            }
            const reponse = await api.post('ens-reg/entete',dbData)
            return({success:true,data: reponse.data.data})
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
    };

    async modifEntete(idEntete:number,corpsEntete:Omit<entete_ensembles_reglement_stationnement,'id_er'>):Promise<ReponseEnteteEnsembleReglementStationnement>{
        try{
            const dbData:Omit<entete_ensembles_reglement_stationnement,'id_er'>={
                description_er:corpsEntete.description_er,
                date_debut_er:corpsEntete.date_debut_er,
                date_fin_er:corpsEntete.date_fin_er
            }
            const reponse = await api.put(`ens-reg/entete/${idEntete}`,dbData)
            return({success:true,data: reponse.data.data})
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
    async supprimeEnsReg(idEnsReg:number):Promise<boolean>{
        try{
            const reponse = await api.delete(`ens-reg/${idEnsReg}`)
            return(reponse.data.success)
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
    async nouvelleAssoc(assocASauver:Omit<association_util_reglement,'id_assoc_er_reg'>):Promise<ReponseAssociationEnsembleReglement>{
        try{
            const dbData:Omit<association_util_reglement,'id_assoc_er_reg'>={
                id_er:assocASauver.id_er,
                id_reg_stat:assocASauver.id_reg_stat,
                cubf:assocASauver.cubf
            }
            const reponse = await api.post('ens-reg/assoc',dbData)
            return({success:true,data: reponse.data.data})
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
    async modifAssoc(idAssocAModif:number,assocASauver:Omit<association_util_reglement,'id_assoc_er_reg'>):Promise<ReponseAssociationEnsembleReglement>{
        try{
            const dbData:Omit<association_util_reglement,'id_assoc_er_reg'>={
                id_er:assocASauver.id_er,
                id_reg_stat:assocASauver.id_reg_stat,
                cubf:assocASauver.cubf
            }
            const reponse = await api.put( `ens-reg/assoc/${idAssocAModif}`,dbData)
            return({success:true,data: reponse.data.data})
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
    async supprimeAssoc(idAssocASupprimer:number):Promise<boolean>{
        try{
            const reponse = await api.delete( `ens-reg/assoc/${idAssocASupprimer}`)
            const success:boolean = reponse.data.success
            return(success)
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

    async obtiensReglementsUnitesParCUBF(idEnsReg:number[],cubf:number):Promise<ReponseUnitesGraph>{
        try{
            const dbData={
                cubf:cubf,
                id_er:idEnsReg
            }
            const response:AxiosResponse<ReponseUnitesGraph>= await api.post(`/ens-reg/informations-pour-graphique`,[dbData]);
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

    async obtiensDonneesGraphiques(idEnsReg:number[],cubf:number,unite:number,valMin:number,valMax:number,pas:number):Promise<ReponseDataGraphique>{
        try{
            const response:AxiosResponse<ReponseDataGraphique>= await api.get(`/ens-reg/data-graphique?cubf=${cubf}&id_er=${idEnsReg.join(',')}&unite=${unite}&val_min=${valMin}&val_max=${valMax}&pas_graphe=${pas}`,);
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
}

export const   serviceEnsemblesReglements =  new ServiceEnsemblesReglements();