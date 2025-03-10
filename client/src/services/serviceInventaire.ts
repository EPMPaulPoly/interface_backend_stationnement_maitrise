
import { ReponseInventaire,ReponseDBInventaire, ReponseDBCadastreGeoSeul} from '../types/serviceTypes';
import api from './api';
import axios,{AxiosResponse} from 'axios';
import { FeatureCollection,Geometry,Feature } from 'geojson';
import { inventaire_stationnement } from '../types/DataTypes';
import { isNumberObject } from 'util/types';

export const serviceInventaire = {
    obtientInventaireParQuartier: async(id_quartier:number) : Promise<ReponseInventaire> => {
        try {
            const response: AxiosResponse<ReponseDBInventaire> = await api.get(`/inventaire/quartier/${id_quartier}`);
            const data_res = response.data.data;
            console.log('Recu Inventaire')
            return {success:response.data.success,data:data_res};
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

    obtientInventaireParId:async(id_lot:string) : Promise<ReponseInventaire> =>{
        try {
            const response: AxiosResponse<ReponseDBInventaire> = await api.get(`/inventaire/no_lot/${id_lot}`);
            const data_res = response.data.data;
            console.log('Recu Inventaire')
            return {success:response.data.success,data:data_res};
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

    recalculeQuartierComplet:async(id_quartier:number) : Promise<ReponseInventaire> =>{
        try {
            console.log('recalcul Quarier complet')
            const response= await api.get<ReponseDBInventaire>(`/inventaire/calcul/quartier/${id_quartier}`);

            //const reponseGeomLots= await api.get<ReponseDBCadastreGeoSeul>(`/cadastre/lot/quartier-ana/${id_quartier}`)
           
            console.log('obtenu resultats')
            const data_res = response.data.data; 
            console.log('Recu Inventaire')
            return {success:response.data.success,data:data_res};
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

    recalculeLotSpecifique: async(id_lot:string) : Promise<ReponseInventaire>=>{
        try {
            console.log('recalcul lot specifique')
            const formattedId = id_lot.replace(/ /g, "_");
            const response= await api.get<ReponseDBInventaire>(`/inventaire/calcul/lot/${formattedId}`);
            const data_res = response.data.data; 
            console.log('Recu Inventaire')
            return {success:response.data.success,data:data_res};
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

    modifieInventaire:async(id_inv:number|null,inventaireAEnvoyer:inventaire_stationnement) :Promise<boolean>=>{
        try {
            if (!isNaN(Number(id_inv))){
                const dbData: Partial<inventaire_stationnement> = {
                    ...(inventaireAEnvoyer.g_no_lot && { g_no_lot: inventaireAEnvoyer.g_no_lot }),
                    ...(inventaireAEnvoyer.n_places_min && { n_places_min: inventaireAEnvoyer.n_places_min }),
                    ...(inventaireAEnvoyer.n_places_max && { n_places_max: inventaireAEnvoyer.n_places_max  }),
                    ...(inventaireAEnvoyer.n_places_estime && { n_places_estime: inventaireAEnvoyer.n_places_estime}),
                    ...(inventaireAEnvoyer.n_places_mesure && { n_places_mesure: inventaireAEnvoyer.n_places_mesure }),
                    ...(inventaireAEnvoyer.id_er && { id_er: inventaireAEnvoyer.id_er }),
                    ...(inventaireAEnvoyer.id_reg_stat && { id_reg_stat: inventaireAEnvoyer.id_reg_stat }),
                    ...(inventaireAEnvoyer.commentaire && { commentaire: inventaireAEnvoyer.commentaire  }),
                    ...(inventaireAEnvoyer.methode_estime && { methode_estime: inventaireAEnvoyer.methode_estime  }),
                    ...(inventaireAEnvoyer.cubf && { methode_estime: inventaireAEnvoyer.methode_estime  }),
                  };
                const reponseMAJInv = await api.post(`/inventaire/${id_inv}`,dbData);
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