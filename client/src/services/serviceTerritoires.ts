import axios,{ AxiosResponse } from 'axios';
import { territoire, territoireGeoJsonProperties } from '../types/DataTypes';
import { ReponseTerritoire,ReponseDbTerritoire, } from '../types/serviceTypes';
import api from './api';
import { FeatureCollection,Geometry } from 'geojson';

class ServiceTerritoires {
    async chercheTerritoiresParPeriode(id:number):Promise<ReponseTerritoire> {
        try {
            const response: AxiosResponse<ReponseDbTerritoire> = await api.get(`/territoire/periode/${id}`);
            const data_res = response.data.data;
            const featureCollection: FeatureCollection<Geometry, territoireGeoJsonProperties> = {
                type: "FeatureCollection",
                features: data_res.map((item) => ({
                    type: "Feature",
                    geometry: JSON.parse(item.geojson_geometry),
                    properties: {
                        id_periode_geo: item.id_periode_geo,
                        id_periode: item.id_periode,
                        ville: item.ville,
                        secteur: item.secteur
                    }
                }))
            };
            const territoires = data_res.map((item: any) => ({
                ...item,
                geojson_geometry: JSON.parse(item.geojson_geometry), // Parse the GeoJSON string
            }));
            console.log(territoires)
            return {success:response.data.success,data:featureCollection};
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
}

export const serviceTerritoires =  new ServiceTerritoires();