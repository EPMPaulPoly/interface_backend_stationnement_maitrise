import { MenuInventaireProps } from "../types/InterfaceTypes";
import { serviceInventaire,serviceCadastre } from "../services";
import L, { LatLngExpression } from 'leaflet';
import { inventaire_stationnement } from "../types/DataTypes";
import { MAJLotsInventaireProps } from "../types/utilTypes";
import metAJourLotsInventaire from "../utils/metAJourLotsInventaire";
const MenuInventaire:React.FC<MenuInventaireProps>=(props:MenuInventaireProps)=>{

    // Gestion de selection de quartier
    const gestSelectQuartier = async (quartier_selectionne:number) =>{
        props.defQuartier(quartier_selectionne)
        const propsMAJ:MAJLotsInventaireProps= {
            defInventaire:props.defInventaireActuel,
            defLotsDuQuartier:props.defLotsDuQuartier
        }
        const succes = await metAJourLotsInventaire(quartier_selectionne,propsMAJ)
        if (succes) {
            // Ensure lotsDuQuartier is updated before proceeding
            // This might require a slight delay or a state update callback
            await new Promise(resolve => setTimeout(resolve, 0)); // Wait for the next tick
    
            // Check if lotsDuQuartier is defined and has features
            if (props.lotsDuQuartier && props.lotsDuQuartier.features.length > 0) {
                const geoJsonLayer = new L.GeoJSON(props.lotsDuQuartier);
                const bounds = geoJsonLayer.getBounds();
    
                // Check if bounds are valid
                if (bounds.isValid()) {
                    const center = bounds.getCenter();
                    props.defPositionDepart(center);
                    props.defZoomDepart(12);
                } else {
                    console.error('Bounds are not valid');
                }
            } else {
                console.error('lotsDuQuartier is not defined or has no features');
            }
        } else {
            alert('Obtention inventaire échouée');
        }
    }

    const filtrerInventairePourChangements = (nouvelInventairePotentiel:inventaire_stationnement[])=>{
        const filtreStationnementMin = nouvelInventairePotentiel.filter((o)=>
            o.n_places_min!==props.inventaireActuel.find((i)=>i.g_no_lot===o.g_no_lot && i.methode_estime===2)?.n_places_min || 
            o.n_places_max!==props.inventaireActuel.find((i)=>i.g_no_lot===o.g_no_lot && i.methode_estime===2)?.n_places_max ||
            o.id_er!==props.inventaireActuel.find((i)=>i.g_no_lot===o.g_no_lot && i.methode_estime===2)?.id_er ||
            o.id_reg_stat!==props.inventaireActuel.find((i)=>i.g_no_lot===o.g_no_lot && i.methode_estime===2)?.id_reg_stat ||
            o.cubf!==props.inventaireActuel.find((i)=>i.g_no_lot===o.g_no_lot && i.methode_estime===2)?.cubf
        )
        return filtreStationnementMin

    }

    const gestCalculInventaire= async()=>{
        props.defChargement(true)
        if (props.quartier != -1){
            props.defPanneauComparInventaireQuartierVis(true)
            const inventaire = await serviceInventaire.recalculeQuartierComplet(props.quartier)
            const inventaireFiltre = filtrerInventairePourChangements(inventaire.data)
            props.defNouvelInventaireQuartier(inventaireFiltre)
        }
        props.defChargement(false)
    }

    const gestMontrerLots=()=>{
        if (props.montrerTousLots){
            props.defMontrerTousLots(false)
        } else{
            props.defMontrerTousLots(true)
        }
    }

    const gestChoro=()=>{
        console.log("Couleur pas encore gérée")
    }

    return(
        <div className="table-inventaire-control">
                <label htmlFor="select-quartier">Sélection Quartier</label>
                <select id="select-quartier" name="select-quartier" onChange={e => gestSelectQuartier(Number(e.target.value))}>
                    <option value="">Selection quartier</option>
                    {props.optionsQuartier.map(quartier=>(
                        <option key={quartier.id_quartier} value={quartier.id_quartier} >
                            {quartier.nom_quartier}
                        </option>
                    ))}
                </select>
                <button onClick={gestCalculInventaire}>
                    Recalcule Inventaire Quartier
                </button>
                <label 
                    htmlFor="show-all-lots" 
                    className="label-show-all-lots">
                        Montrer Tous Lots</label>
                <input 
                    type="checkbox" 
                    id="show-all-lots"
                    checked={props.montrerTousLots}
                    onChange={gestMontrerLots}/>
               
                <label 
                    htmlFor="valeur-choroplethe" 
                    className="label-valeur-choroplethe">
                        Échelle Couleur</label>
                <select 
                    id="valeur-choroplethe" 
                    name="valeur-choroplethe" 
                    onChange={gestChoro}>
                    <option>Aucun</option>
                    <option>places/superf terrain</option>
                    <option>places</option>
                </select>
            </div>
    )
}

export default MenuInventaire;