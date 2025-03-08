
import { ReponseInventaire,ReponseDBInventaire, ReponseDBCadastreGeoSeul} from '../types/serviceTypes';
import api from './api';
import axios,{AxiosResponse} from 'axios';
import { FeatureCollection,Geometry,Feature } from 'geojson';
import { inventaire_stationnement, inventaireGeoJSONProps ,} from '../types/DataTypes';
import { isNumberObject } from 'util/types';

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
                                    id_reg_stat:item.id_reg_stat,
                                    commentaire: item.commentaire,
                                    id_inv: item.id_inv
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

    obtientInventaireParId:async(id_lot:string) : Promise<ReponseInventaire> =>{
        try {
            const response: AxiosResponse<ReponseDBInventaire> = await api.get(`/inventaire/no_lot/${id_lot}`);
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
                        id_reg_stat:item.id_reg_stat,
                        commentaire:item.commentaire,
                        id_inv:item.id_inv
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

    recalculeQuartierComplet:async(id_quartier:number) : Promise<ReponseInventaire> =>{
        try {
            console.log('recalcul Quarier complet')
            const response= await api.get<ReponseDBInventaire>(`/inventaire/calcul/quartier/${id_quartier}`);

            const reponseGeomLots= await api.get<ReponseDBCadastreGeoSeul>(`/cadastre/lot/quartier-ana/${id_quartier}`)
           
            console.log('obtenu resultats')
            const data_res = response.data.data; 
            const data_geom = reponseGeomLots.data.data;
            const featureCollection: FeatureCollection<Geometry, inventaireGeoJSONProps> = {
                type: "FeatureCollection",
                features: data_res
                    .map((item): Feature<Geometry, inventaireGeoJSONProps> | null => {
                        const foundGeom = data_geom.find(o => o.g_no_lot === item.g_no_lot);
                        const geometry: Geometry | null = foundGeom?.geojson_geometry 
                            ? JSON.parse(foundGeom.geojson_geometry) as Geometry 
                            : null; // Ensure it's typed correctly
            
                        if (!geometry) return null; // Skip features with no geometry
            
                        return {
                            type: "Feature",
                            geometry, 
                            properties: {
                                g_no_lot: item.g_no_lot,
                                n_places_min: item.n_places_min,
                                n_places_max: item.n_places_max,
                                n_places_estime: item.n_places_estime,
                                n_places_mesure: item.n_places_mesure,
                                methode_estime: item.methode_estime,
                                cubf: item.cubf,
                                id_er: item.id_er,
                                id_reg_stat: item.id_reg_stat,
                                commentaire: item.commentaire,
                                id_inv:null
                            }
                        };
                    })
                    .filter((feature): feature is Feature<Geometry, inventaireGeoJSONProps> => feature !== null) // Type guard to remove nulls
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

    recalculeLotSpecifique: async(id_lot:string) : Promise<ReponseInventaire>=>{
        try {
            console.log('recalcul lot specifique')
            const formattedId = id_lot.replace(/ /g, "_");
            const response= await api.get<ReponseDBInventaire>(`/inventaire/calcul/lot/${formattedId}`);

            const reponseGeomLots= await api.get<ReponseDBCadastreGeoSeul>(`/cadastre/lot/${formattedId}`)
           
            console.log('obtenu resultats')
            const data_res = response.data.data; 
            const data_geom = reponseGeomLots.data.data;
            const featureCollection: FeatureCollection<Geometry, inventaireGeoJSONProps> = {
                type: "FeatureCollection",
                features: data_res
                    .map((item): Feature<Geometry, inventaireGeoJSONProps> | null => {
                        const foundGeom = data_geom.find(o => o.g_no_lot === item.g_no_lot);
                        const geometry: Geometry | null = foundGeom?.geojson_geometry 
                            ? JSON.parse(foundGeom.geojson_geometry) as Geometry 
                            : null; // Ensure it's typed correctly
            
                        if (!geometry) return null; // Skip features with no geometry
            
                        return {
                            type: "Feature",
                            geometry, 
                            properties: {
                                g_no_lot: item.g_no_lot,
                                n_places_min: item.n_places_min,
                                n_places_max: item.n_places_max,
                                n_places_estime: item.n_places_estime,
                                n_places_mesure: item.n_places_mesure,
                                methode_estime: item.methode_estime,
                                cubf: item.cubf,
                                id_er: item.id_er,
                                id_reg_stat: item.id_reg_stat,
                                commentaire: item.commentaire,
                                id_inv: item.id_inv
                            }
                        };
                    })
                    .filter((feature): feature is Feature<Geometry, inventaireGeoJSONProps> => feature !== null) // Type guard to remove nulls
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

    modifieInventaire:async(id_inv:number|null,inventaireAEnvoyer:Feature<Geometry|null, inventaireGeoJSONProps>) :Promise<boolean>=>{
        try {
            if (!isNaN(Number(id_inv))){
                const dbData: Partial<inventaire_stationnement> = {
                    ...(inventaireAEnvoyer.properties.g_no_lot && { g_no_lot: inventaireAEnvoyer.properties.g_no_lot }),
                    ...(inventaireAEnvoyer.properties.n_places_min && { n_places_min: inventaireAEnvoyer.properties.n_places_min }),
                    ...(inventaireAEnvoyer.properties.n_places_max && { n_places_max: inventaireAEnvoyer.properties.n_places_max  }),
                    ...(inventaireAEnvoyer.properties.n_places_estime && { n_places_estime: inventaireAEnvoyer.properties.n_places_estime}),
                    ...(inventaireAEnvoyer.properties.n_places_mesure && { n_places_mesure: inventaireAEnvoyer.properties.n_places_mesure }),
                    ...(inventaireAEnvoyer.properties.id_er && { id_er: inventaireAEnvoyer.properties.id_er }),
                    ...(inventaireAEnvoyer.properties.id_reg_stat && { id_reg_stat: inventaireAEnvoyer.properties.id_reg_stat }),
                    ...(inventaireAEnvoyer.properties.commentaire && { commentaire: inventaireAEnvoyer.properties.commentaire  }),
                    ...(inventaireAEnvoyer.properties.methode_estime && { methode_estime: inventaireAEnvoyer.properties.methode_estime  }),
                    ...(inventaireAEnvoyer.properties.cubf && { methode_estime: inventaireAEnvoyer.properties.methode_estime  }),
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