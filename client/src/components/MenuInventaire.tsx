import { MenuInventaireProps } from "../types/InterfaceTypes";
import { serviceInventaire,serviceCadastre } from "../services";
import L, { LatLngExpression } from 'leaflet';
import { inventaire_stationnement } from "../types/DataTypes";
const MenuInventaire:React.FC<MenuInventaireProps>=(props:MenuInventaireProps)=>{

    // Gestion de selection de quartier
    const gestSelectQuartier = async (quartier_selectionne:number) =>{
        props.defQuartier(quartier_selectionne)
        const inventaire = await serviceInventaire.obtientInventaireParQuartier(quartier_selectionne)
        const lots = await serviceCadastre.obtiensCadastreParQuartier(quartier_selectionne)
        if (lots.success && inventaire.success){
            props.defLotsDuQuartier(lots.data)
            props.defInventaireActuel(inventaire.data)
            const center = new L.GeoJSON(lots.data).getBounds().getCenter();
            props.defPositionDepart(center);
            props.defZoomDepart(12);
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
                    Calcul de stationnement
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