
import { ReponseInventaire,ReponseDBInventaire } from '../types/serviceTypes';
import api from './api';
import axios,{AxiosResponse} from 'axios';
import { FeatureCollection,Geometry } from 'geojson';
import { inventaireGeoJSONProps } from '../types/DataTypes';

export const serviceInventaire = {
    obtientInventaireParQuartier: async(id_quartier:number) : Promise<ReponseInventaire> => {
        try {
            const response: AxiosResponse<ReponseDBInventaire> = await api.get(`/inventaire/quartier/${id_quartier}`);
            const data_res = response.data.data;

            const featureCollection: FeatureCollection<Geometry, inventaireGeoJSONProps> = {
                            type: "FeatureCollection",
                            features: data_res.map((item) => ({
                                type: "Feature",
                                geometry: JSON.parse(item.geojson_geometry),
                                properties: {
                                    g_no_lot:item.g_no_lot,
                                    n_places_min: item.n_places_min,
                                    n_places_max: item.n_places_max,
                                    n_places_estime: item.n_places_estime,
                                    n_places_mesure:item.n_places_mesure,
                                    methode_estime:item.methode_estime,
                                    cubf:item.cubf,
                                    id_er:item.id_er,
                                    id_reg_stat:item.id_reg_stat
                                }
                            }))
                        };
            console.log('Recu Inventaire')
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
};