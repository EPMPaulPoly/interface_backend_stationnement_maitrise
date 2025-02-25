import { serviceInventaire } from "../services";
import { calculateRegLotInventoryProps } from "../types/InterfaceTypes";

const recalculeInventaireLot = async (props:calculateRegLotInventoryProps): Promise<void> => {
    console.log('Commencement calcul Automatique');
    if (props.lots.features[0].properties.g_no_lot && props.modifEnMarche) {
        const nouvelInventaire = await serviceInventaire.recalculeLotSpecifique(props.lots.features[0].properties.g_no_lot);
        props.defInventaireProp(nouvelInventaire.data.features[0]);
        props.defNvInvRegATrait(true);
        console.log('Nouvel Inventaire Obtenu, variable boolean true');
        debugger;
    }
}

export default recalculeInventaireLot;