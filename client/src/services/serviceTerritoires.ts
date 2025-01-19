import axios,{ AxiosResponse } from 'axios';
import { territoire } from '../types/DataTypes';
import { ReponseTerritoire } from '../types/serviceTypes';
import api from './api';

class ServiceTerritoires {
    async chercheTerritoiresParPeriode(id:number):Promise<ReponseTerritoire> {
        try {
            const response: AxiosResponse<ReponseTerritoire> = await api.get(`/territoire/periode/${id}`);
            const data = response.data.data;

            const territoires = data.map((item: any) => ({
                ...item,
                geojson_geometry: JSON.parse(item.geojson_geometry), // Parse the GeoJSON string
              }));
              console.log(territoires)
              return {success:response.data.success,data:territoires};
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