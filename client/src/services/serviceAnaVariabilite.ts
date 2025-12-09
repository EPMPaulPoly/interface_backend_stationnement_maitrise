import { ReponseCalculComplete, ReponseDataGraphique, ReponseDataGraphiqueText, ReponseResultatAnaVarBarre, ReponseResultatAnaVarHisto } from '../types/serviceTypes';
import api from './api';
import axios, { AxiosResponse } from 'axios';
import { data_box_plot, data_graphique, data_graphique_text_labels, resultatAnalyseVariabilite } from '../types/DataTypes';
export const serviceAnaVariabilite = {
    recalculeInventairesFonciersAvecTousEnsRegs: async (): Promise<boolean> => {
        try {
            const response: AxiosResponse<ReponseCalculComplete> = await api.get(`/ana-var/recalcule-inventaires-tous-ens-regs`);
            return response.data.success ?? false;
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
    obtiensInventairesEnsRegs: async (ids: number[], idRef?: number, cubf_n1?: number,voirInv?:boolean): Promise<ReponseDataGraphiqueText> => {
        try {
            let query_add: string[] = [];
            if (typeof idRef !== 'undefined') {
                query_add.push(`id_ref=${idRef}`)
            }
            if (typeof cubf_n1 !== 'undefined') {
                query_add.push(`cubf_n1=${cubf_n1}`)
            }
            if (typeof voirInv !=='undefined'){
                query_add.push(`voir_inv=${voirInv}`)
            }
            let base_query: string = `/ana-var/obtiens-donnees-varia?id_er=${ids.join(',')}`
            if (query_add.length > 0) {
                base_query += '&' + query_add.join('&')
            }
            const response: AxiosResponse<ReponseResultatAnaVarBarre> = await api.get(base_query);
            const donnees: resultatAnalyseVariabilite[] = response.data.data
            let formatted_output: data_graphique_text_labels
            let idsCopy = [...ids]
            if (ids.length > 0) {
                const land_uses = Array.from(new Set(donnees.map((row) => row.cubf)));
                if (voirInv){
                    idsCopy.unshift(-5)
                }
                formatted_output = {
                    labels: idsCopy.map((id) => { return donnees.find((row) => row.id_er === id)?.description_er ?? 'N/A' }),
                    datasets: land_uses.map((lu) => {
                        const lu_filter_data = donnees.filter((row) => row.cubf === lu);
                        return {
                            label: lu_filter_data[0]?.desc_cubf ?? 'N/A',
                            data: idsCopy.map((id) => Number(lu_filter_data.find((row) => row.id_er === id)?.valeur ?? 0)),
                            cubf: lu_filter_data[0]?.cubf ?? -1,
                        };
                    })
                }
            } else {
                const land_uses = Array.from(new Set(donnees.map((row) => row.cubf)));
                const rulesets = Array.from(new Set(donnees.map((row)=>row.id_er)));
                formatted_output = {
                    labels: rulesets.map(id => {
                        const desc = donnees.find(row => row.id_er === id)?.description_er;
                        return desc ? String(desc) : 'N/A';
                    }),
                    datasets: land_uses.map((lu) => {
                        const lu_filter_data = donnees.filter((row) => row.cubf === lu);
                        return {
                            label: lu_filter_data[0]?.desc_cubf ?? 'N/A',
                            data: rulesets.map((id) => {
                                return lu_filter_data.find((row) => row.id_er === id)?.valeur ?? 0}),
                            cubf: lu_filter_data[0]?.cubf ?? -1,
                        }
                    })
                }
            }
            return ({
                success: response.data.success,
                data: formatted_output
            });
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
    obtiensDistributionInventaire: async(ids:number[],cubf_n1?:number,ratioInvAct?:boolean):Promise<ReponseDataGraphiqueText> =>{
        try {
            let query_add: string[] = [];
            
            if (typeof cubf_n1 !== 'undefined') {
                query_add.push(`cubf_n1=${cubf_n1}`)
            }
            if (ratioInvAct!==undefined){
                query_add.push(`ratio_inv_act=${ratioInvAct}`)
            }
            let base_query: string = `/ana-var/histo-varia?id_er=${ids.join(',')}`
            if (query_add.length > 0) {
                base_query += '&' + query_add.join('&')
            }
            
            const response: AxiosResponse<ReponseResultatAnaVarHisto> = await api.get(base_query);
            let formatted_out: data_graphique_text_labels;
            formatted_out = {
                labels: response.data.data.map((row)=>row.interval_pred),
                datasets: 
                    [
                        {
                            label: response.data.data[0].desc_cubf,
                            data: response.data.data.map((row)=> row.frequence)
                        }
                    ]
                
            }
            return ({
                success: response.data.success,
                data: formatted_out
            });
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
    obtiensBoxPlotFacteurEchelle:async(ids:number[],cubf_n1?:number):Promise<ReponseDataGraphique>=>{
        try {
            let query_add: string[] = [];
            
            if (typeof cubf_n1 !== 'undefined') {
                query_add.push(`cubf_n1=${cubf_n1}`)
            }else{
                query_add.push(`somme_sur_total=true`)
            }
            let base_query: string = `/ana-var/obtiens-donnees-varia?id_er=${ids.join(',')}&inclure_echelle=true`
            if (query_add.length > 0) {
                base_query += '&' + query_add.join('&')
            }
            
            const response: AxiosResponse<ReponseResultatAnaVarBarre> = await api.get(base_query);
            const facteurs_echelles = Array.from(new Set(response.data.data.map((item)=>item.facteur_echelle)))
            const data_out_graphique: data_box_plot = {
                labels: facteurs_echelles,
                datasets: [{
                    label: `Variation Facteur Échelle`,
                    data: facteurs_echelles.map((item) => (response.data.data
                        .filter((item2) => item2.facteur_echelle === item)
                        .map((item3) => item3.valeur)
                ))}]
            }
            if(typeof cubf_n1 === 'undefined'){
                console.log('test')
            }
            return ({
                success: response.data.success,
                data: data_out_graphique
            });
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
    obtiensBoxPlotEstimeCental: async(ids:number[],cubf_n1?:number):Promise<ReponseDataGraphique>=>{
        try {
            let query_add: string[] = [];
            
            if (typeof cubf_n1 !== 'undefined') {
                query_add.push(`cubf_n1=${cubf_n1}`)
            }else{
                query_add.push(`somme_sur_total=true`)
            }
            let base_query: string = `/ana-var/obtiens-donnees-varia?id_er=${ids.join(',')}`
            if (query_add.length > 0) {
                base_query += '&' + query_add.join('&')
            }
            const response: AxiosResponse<ReponseResultatAnaVarBarre> = await api.get(base_query);
            const facteurs_echelles = Array.from(new Set(response.data.data.map((item)=>item.facteur_echelle)))
            const data_out_graphique: data_box_plot = {
                labels: facteurs_echelles,
                datasets: [{
                    label: `Infos distributions`,
                    data: facteurs_echelles.map((item) => (response.data.data
                        .filter((item2) => item2.facteur_echelle === item)
                        .map((item3) => item3.valeur)
                ))}]
            }
            if(typeof cubf_n1 === 'undefined'){
                console.log('test')
            }
            return ({
                success: response.data.success,
                data: data_out_graphique
            });
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