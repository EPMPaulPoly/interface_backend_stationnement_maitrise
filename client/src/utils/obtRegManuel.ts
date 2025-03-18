import { serviceReglements } from '../services/serviceReglements'
import { informations_reglementaire_manuelle } from '../types/DataTypes';

const obtRegManuel=async(idLot:string):Promise<informations_reglementaire_manuelle[]>=>{
    const regManuel = await serviceReglements.obtiensUnitesReglementsParLot(idLot);
    return regManuel.data
}

export default obtRegManuel;