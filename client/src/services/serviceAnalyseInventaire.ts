import { ReponseInventaire,ReponseDBInventaire, ReponseDBInventaireAgregQuartTotal, ReponseInventaireAgregQuartParHab, ReponseDBInventaireAgregQuartParSuperf, ReponseInventaireAgregQuartParSuperf, } from '../types/serviceTypes';
import api from './api';
import axios,{AxiosResponse} from 'axios';
import { FeatureCollection,Geometry,Feature } from 'geojson';
import { isNumberObject } from 'util/types';
import { ReponseInventaireAgregQuartTotal } from '../types/serviceTypes';
import { GeoJSONPropsAnaQuartier,  } from '../types/AnalysisTypes';

export const serviceAnalyseInventaire = {
    obtientInventaireAgregeParQuartier: async(ordre:number[]) : Promise<ReponseInventaireAgregQuartTotal> => {
        try {
            const response: AxiosResponse<ReponseDBInventaireAgregQuartTotal> = await api.get(`/ana-par-quartier/carto/stat-tot/${ordre.join(",")}`);
            const data_res = response.data.data;
            console.log('Recu statistiques quartier')
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
    obtientInventaireAgregeParQuartierParSuperf:async(ordre:number[]) : Promise<ReponseInventaireAgregQuartParSuperf>=>{
        try {
            const response: AxiosResponse<ReponseDBInventaireAgregQuartParSuperf> = await api.get(`/ana-par-quartier/carto/stat-sup/${ordre.join(",")}`);
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
    obtientInventaireAgregeParQuartierPourcentTerritoire:async(ordre:number[]) : Promise<ReponseInventaireAgregQuartParSuperf>=>{
        try {
            const response: AxiosResponse<ReponseDBInventaireAgregQuartParSuperf> = await api.get(`/ana-par-quartier/carto/stat-perc/${ordre.join(",")}`);
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
    obtientInventaireAgregeParQuartierPlacesParVoiture:async(ordre:number[]) : Promise<ReponseInventaireAgregQuartParSuperf>=>{
        try {
            const response: AxiosResponse<ReponseDBInventaireAgregQuartParSuperf> = await api.get(`/ana-par-quartier/carto/stat-voit/${ordre.join(",")}`);
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
    obtientInventaireAgregeParQuartierPlacesParPersonne:async(ordre:number[]) : Promise<ReponseInventaireAgregQuartParSuperf>=>{
        try {
            const response: AxiosResponse<ReponseDBInventaireAgregQuartParSuperf> = await api.get(`/ana-par-quartier/carto/stat-popu/${ordre.join(",")}`);
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
    }
};