import { ReponseDBInventaireAgregQuartTotal,  ReponseDBInventaireAgregQuartParSuperf, ReponseInventaireAgregQuartParSuperf, ReponseXYAnalyseQuartier,ReponseInventaireAgregQuartTotal,ReponseHistoAnalyse,ReponseDBVariableAgregQuart } from '../types/serviceTypes';
import api from './api';
import axios,{AxiosResponse} from 'axios';
import { FeatureCollection,Geometry } from 'geojson';
import { GeoJSONPropsAnaQuartier,  } from '../types/AnalysisTypes';
import { barChartDataSet } from '../types/DataTypes';
export const serviceAnalyseInventaire = {
    recalculeInventaireBackend:async() :Promise<boolean>=>{
        try {
            const response: AxiosResponse<ReponseDBInventaireAgregQuartParSuperf> = await api.get(`/ana-par-quartier/recalcule-stat-agreg`);
            return response.data.success??false;
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
    recalculeDonneesFoncieresBackend:async():Promise<boolean>=>{
        try {
            const response: AxiosResponse<ReponseDBInventaireAgregQuartParSuperf> = await api.get(`/ana-par-quartier/recalcule-val-autres`);
            return response.data.success??false;
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
    obtientVariableAgregeParQuartierCarto:async(ordre:number[]|undefined, variableKey:string):Promise<ReponseHistoAnalyse>=>{
        try  {
            let query;
            if (typeof ordre=== 'undefined'){
                query = `/ana-par-quartier/carto?variable=${variableKey}`
            } else{
                query = `/ana-par-quartier/carto?variable=${variableKey}&ordre=${ordre.join(",")}`
            }
            const response:AxiosResponse<ReponseDBVariableAgregQuart> = await api.get(query)
            const data_res = response.data.data;
            console.log('Recu Inventaire')
            const featureCollection: FeatureCollection<Geometry, GeoJSONPropsAnaQuartier> = {
                type: "FeatureCollection",
                features: data_res.map((item) => ({
                    type: "Feature",
                    geometry: JSON.parse(item.geojson_geometry),
                    properties: {
                        id_quartier:item.id_quartier,
                        description: item.description,
                        valeur:item.valeur,
                        superficie_quartier:item.superf_quartier,
                        nom_quartier:item.nom_quartier
                    }
                }))
            };
            return {success:response.data.success,data:featureCollection};
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
    obtientVariableAgregeParQuartierHisto:async(ordre:number[]|undefined, variableKey:string):Promise<ReponseHistoAnalyse>=>{
        try  {
            let query;
            if (typeof ordre=== 'undefined'){
                query = `/ana-par-quartier/histo?variable=${variableKey}`
            } else{
                query = `/ana-par-quartier/histo?variable=${variableKey}&ordre=${ordre.join(",")}`
            }
            const response:AxiosResponse<ReponseHistoAnalyse> = await api.get(query)
            return {success:response.data.success,data:response.data.data};
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
    obtientDonneesGraphiqueXY:async(ordre:number[]|undefined,XKey:string,YKey:string):Promise<ReponseXYAnalyseQuartier>=>{
        try{
            let query_address;
            if ((XKey.includes('stat') || YKey.includes('stat')) && (typeof ordre !== 'undefined') ){
                query_address = `/ana-par-quartier/XY?ordre=${ordre.join(",")}&X=${XKey}&Y=${YKey}`
            } else if((~XKey.includes('stat') || ~YKey.includes('stat'))){
                query_address = `/ana-par-quartier/XY?X=${XKey}&Y=${YKey}`
            } else{
                throw new Error("Besoin de spécifier l'ordre de priorité si une variable de stationnement est requise")
            }
            const reponse: AxiosResponse<ReponseXYAnalyseQuartier> = await api.get(query_address)
            console.log('Recu donnees graphique XY quartier')
            return ({success:reponse.data.success,data:reponse.data.data})
        } catch(error:any){
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