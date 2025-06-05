import { ReponseCUBF } from '../types/serviceTypes';
import api from './api';
import axios,{AxiosResponse} from 'axios';
import { FeatureCollection,Geometry } from 'geojson';
import { GeoJSONPropsAnaQuartier,  } from '../types/AnalysisTypes';
import { barChartDataSet } from '../types/DataTypes';
export const serviceUtilisationDuSol = {
    obtientUtilisationDuSol:async(cubf?:number) :Promise<ReponseCUBF>=>{
        try {
            let response:AxiosResponse<ReponseCUBF>
            if (typeof cubf === 'undefined') {
                response = await api.get(`/cubf`);
            } else if (cubf<0){
                response = await api.get(`/cubf?niveau=1`)
            } else if ( cubf<10){
                response = await api.get(`/cubf?niveau=2&cubf=${cubf}`)
            } else if (cubf<100){
                response = await api.get(`/cubf?niveau=3&cubf=${cubf}`)
            } else if (cubf<1000){
                response = await api.get(`/cubf?niveau=4&cubf=${cubf}`)
            } else if (cubf >= 1000) {
                response = await api.get(`/cubf?cubf=${cubf}`);
            } else {
                // Handle other cases or throw an error if needed
                throw new Error('combinaison invalide de cubf et niveau');
            }
            return {success:true,data:response.data.data};
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
    
};

export default serviceUtilisationDuSol;