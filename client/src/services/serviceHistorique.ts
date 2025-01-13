
import { ReponsePeriode } from '../types/serviceTypes';

export const serviceHistorique = {
    getAll: async() : Promise<ReponsePeriode> => {
        const responseData = [
            {id_periode: 1, nom_periode: 'periode1', date_debut_periode: 2000, date_fin_periode: 2001},
            {id_periode: 2, nom_periode: 'periode2', date_debut_periode: 2002, date_fin_periode: 2003},
            {id_periode: 3, nom_periode: 'periode3', date_debut_periode: 2004, date_fin_periode: 2005},
        ]
        return {
            success:true,
            data: responseData
        };
    },
};