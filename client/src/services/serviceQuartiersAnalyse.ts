import axios,{ AxiosResponse } from 'axios';
import { quartiers_analyse } from '../types/DataTypes';
import { ReponseQuartiersAnalyse } from '../types/serviceTypes';
import api from './api';


class ServiceQuartiersAnalyse {
    async chercheTousQuartiersAnalyse():Promise<ReponseQuartiersAnalyse> {
        try {
            const response: AxiosResponse<ReponseQuartiersAnalyse> = await api.get(`/quartiers-analyse`);
            const data = response.data.data;

            const quartiers = data.map((item: any) => ({
                ...item,
                geojson_geometry: JSON.parse(item.geojson_geometry), // Parse the GeoJSON string
            }));
            console.log('Recu les quartiers')
            return {success:response.data.success,data:quartiers};
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

export const serviceQuartiersAnalyse =  new ServiceQuartiersAnalyse();