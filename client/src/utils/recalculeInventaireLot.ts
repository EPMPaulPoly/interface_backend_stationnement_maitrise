import { serviceInventaire } from "../services";
import { calculateRegLotInventoryProps } from "../types/utilTypes";

const recalculeInventaireLot = async (props:calculateRegLotInventoryProps): Promise<void> => {
    console.log('Commencement calcul Automatique');
    if (props.lots.properties.g_no_lot && props.modifEnMarche) {
        const nouvelInventaire = await serviceInventaire.recalculeLotSpecifique(props.lots.properties.g_no_lot);
        props.defInventaireProp(nouvelInventaire.data[0]);
        props.defNvInvRegATrait(true);
        console.log('Nouvel Inventaire Obtenu, variable boolean true');
        //debugger;
    }
}

export default recalculeInventaireLot;