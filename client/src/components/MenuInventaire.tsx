import { MenuInventaireProps } from "../types/InterfaceTypes";
import { serviceInventaire,serviceCadastre } from "../services";
import L, { LatLngExpression } from 'leaflet';
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

    const gestCalculInventaire= async()=>{
        props.defChargement(true)
        if (props.quartier != -1){
            props.defPanneauComparInventaireQuartierVis(true)
            const inventaire = await serviceInventaire.recalculeQuartierComplet(props.quartier)
            props.defNouvelInventaireQuartier(inventaire.data)
        }
        props.defChargement(false)
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
                    id="show-all-lots"/>
               
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