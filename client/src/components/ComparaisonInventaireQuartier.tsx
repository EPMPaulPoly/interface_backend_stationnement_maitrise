import { ComparaisonInventaireQuartierProps } from "../types/InterfaceTypes";
import { FaCheck } from "react-icons/fa";
import React from 'react';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import { Delete } from "@mui/icons-material";

const ComparaisonInventaireQuartier:React.FC<ComparaisonInventaireQuartierProps>=(props:ComparaisonInventaireQuartierProps)=>{
    const gestAnnulCalculQuartier=()=>{
        console.log('Annuldation calcul Quartier')
        props.defNouvelInventaireReg({//inventaire vide
            type: "FeatureCollection",
            features: []
        })
        props.defValidationInventaireQuartier(false)
    }
    const gestAnnulerItem=(noLot:string)=>{
        console.log('A implementer - gest annul item')
    }
    const gestApprouverItem=(noLot:string)=>{
        console.log('A implementer - get approuver item')
    }
    const gestApprobationMasse=()=>{
        console.log('A implementer - gest approbation masse')
    }
    return(
        <div className="panneau-confirmation-inventaire-quartier">
            {props.chargement ? 
            (<p>Chargement en cours</p>)
            :(<>
            <button onClick={gestAnnulCalculQuartier}>Annuler</button>
            <button onClick={gestApprobationMasse}>Approuver Tous</button>
            <div className="conteneur-table-comparaison-quartier">
                <table className="table-comparaison-inventaire-quartier">
                    <thead>
                        <tr>
                            <th></th>
                            <th colSpan={4}>Nouvel Inventaire</th>
                            <th colSpan={4}>Ancien Inventaire</th>
                            <th></th>
                            <th></th>
                        </tr>
                        <tr>
                            <th>Lot</th>
                            <th>N Places Min</th>
                            <th>N Places Max</th>
                            <th>Ens. Reg.</th>
                            <th>Reg. </th>
                            <th>N Places Min</th>
                            <th>N Places Max</th>
                            <th>Ens. Reg.</th>
                            <th>Reg. </th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.nouvelInventaireReg.features.map((itemNouvelInventaire)=>(
                            itemNouvelInventaire.properties && (
                                <tr key={itemNouvelInventaire.properties.g_no_lot}>
                                    <td>{itemNouvelInventaire.properties.g_no_lot}</td>
                                    <td>{itemNouvelInventaire.properties.n_places_min}</td>
                                    <td>{itemNouvelInventaire.properties.n_places_max}</td>
                                    <td>{itemNouvelInventaire.properties.id_er}</td>
                                    <td>{itemNouvelInventaire.properties.id_reg_stat}</td>
                                    <td>{props.ancienInventaireReg.features.find((o)=>((o.properties.g_no_lot===itemNouvelInventaire.properties.g_no_lot)&&(o.properties.methode_estime===itemNouvelInventaire.properties.methode_estime)))?.properties.n_places_min}</td>
                                    <td>{props.ancienInventaireReg.features.find((o)=>((o.properties.g_no_lot===itemNouvelInventaire.properties.g_no_lot)&&(o.properties.methode_estime===itemNouvelInventaire.properties.methode_estime)))?.properties.n_places_max}</td>
                                    <td>{props.ancienInventaireReg.features.find((o)=>((o.properties.g_no_lot===itemNouvelInventaire.properties.g_no_lot)&&(o.properties.methode_estime===itemNouvelInventaire.properties.methode_estime)))?.properties.id_er}</td>
                                    <td>{props.ancienInventaireReg.features.find((o)=>((o.properties.g_no_lot===itemNouvelInventaire.properties.g_no_lot)&&(o.properties.methode_estime===itemNouvelInventaire.properties.methode_estime)))?.properties.id_reg_stat}</td>
                                    <td onClick={() => gestApprouverItem(itemNouvelInventaire.properties.g_no_lot)}><CheckIcon style={{ color: "#FFFFFF" }}/></td>
                                    <td onClick={() => gestAnnulerItem(itemNouvelInventaire.properties.g_no_lot)}><DeleteIcon style={{ color: "#FFFFFF" }}/></td>
                                </tr>
                            )
                        ))}
                        
                    </tbody>
                </table>
            </div></>)
            }
        </div>
    )
}

export default ComparaisonInventaireQuartier;