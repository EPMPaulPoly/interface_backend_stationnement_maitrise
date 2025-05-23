import axios,{ AxiosResponse } from 'axios';
import { lotCadastralGeoJsonProperties, quartiers_analyse, roleFoncierGeoJsonProps,lotCadastralAvecBoolInvGeoJsonProperties } from '../types/DataTypes';
import { ReponseCadastre, ReponseRole,ReponseDBCadastre,ReponseDBRole, ReponseDBCadastreBoolInv,ReponseCadastreBoolInv } from '../types/serviceTypes';
import api from './api';
import {FeatureCollection, Geometry } from 'geojson';


class ServiceCadastre {
    async chercheTousCadastres():Promise<ReponseCadastre> {
        try {
            const response: AxiosResponse<ReponseDBCadastre> = await api.get(`/cadastre`);
            const data_res = response.data.data;
            const featureCollection: FeatureCollection<Geometry, lotCadastralGeoJsonProperties> = {
                type: "FeatureCollection",
                features: data_res.map((item) => ({
                    type: "Feature",
                    geometry: JSON.parse(item.geojson_geometry),
                    properties: {
                        g_no_lot:item.g_no_lot,
                        g_va_suprf:item.g_va_suprf,
                        g_nb_coo_1:item.g_nb_coo_1,
                        g_nb_coord:item.g_nb_coord,
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
    }
    async obtiensCadastreParId(id:string):Promise<ReponseCadastre> {
        try{
            const formattedId = id.replace(/ /g, "_");
            const response: AxiosResponse<ReponseDBCadastre> = await api.get(`/cadastre/lot/${formattedId}`);
            const data_res = response.data.data;
            const featureCollection: FeatureCollection<Geometry, lotCadastralGeoJsonProperties> = {
                type: "FeatureCollection",
                features: data_res.map((item) => ({
                    type: "Feature",
                    geometry: JSON.parse(item.geojson_geometry),
                    properties: {
                        g_no_lot:item.g_no_lot,
                        g_va_suprf:item.g_va_suprf,
                        g_nb_coo_1:item.g_nb_coo_1,
                        g_nb_coord:item.g_nb_coord,
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
    }
    async chercheRoleAssocieParId(ids:string):Promise<ReponseRole>{
        try {
            const formattedId = ids.replace(/ /g, "_");
            const response: AxiosResponse<ReponseDBRole> = await api.get(`/cadastre/role-associe/${formattedId}`);
            const data_res = response.data.data;
            const featureCollection: FeatureCollection<Geometry, roleFoncierGeoJsonProps> = {
                type: "FeatureCollection",
                features: data_res.map((item) => ({
                    type: "Feature",
                    geometry: JSON.parse(item.geojson_geometry),
                    properties: {
                        id_provinc:item.id_provinc,
                        rl0105a:item.rl0105a,
                        rl0306a:item.rl0306a,
                        rl0307a:item.rl0307a,
                        rl0307b:item.rl0307b,
                        rl0308a:item.rl0308a,
                        rl0311a:item.rl0311a,
                        rl0312a:item.rl0312a,
                        rl0404a:item.rl0404a
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
    }

    async obtiensCadastreParQuartier(id:number):Promise<ReponseCadastreBoolInv>{
        try {
            const response: AxiosResponse<ReponseDBCadastreBoolInv> = await api.get(`/cadastre/lot/quartier-ana/${id}`);
            const data_res = response.data.data;
            const featureCollection: FeatureCollection<Geometry, lotCadastralAvecBoolInvGeoJsonProperties> = {
                type: "FeatureCollection",
                features: data_res.map((item) => ({
                    type: "Feature",
                    geometry: JSON.parse(item.geojson_geometry),
                    properties: {
                        g_no_lot:item.g_no_lot,
                        g_va_suprf:item.g_va_suprf,
                        g_nb_coo_1:item.g_nb_coo_1,
                        g_nb_coord:item.g_nb_coord,
                        bool_inv:item.bool_inv
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
    }
}

export const serviceCadastre =  new ServiceCadastre();