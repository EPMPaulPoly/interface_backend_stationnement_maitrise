import { MAJLotsInventaireProps } from "../types/utilTypes";
import { serviceInventaire,serviceCadastre } from "../services";

const metAJourLotsInventaire = async(quartier_selection:number, props:MAJLotsInventaireProps)=>{
    const inventaire = await serviceInventaire.obtientInventaireParQuartier(quartier_selection)
    const lots = await serviceCadastre.obtiensCadastreParQuartier(quartier_selection)
    if (lots.success && inventaire.success){
        props.defLotsDuQuartier(lots.data)
        props.defInventaire(inventaire.data)
    }
}

export default metAJourLotsInventaire;