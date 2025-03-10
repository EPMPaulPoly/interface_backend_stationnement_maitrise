import { ComparaisonInventaireQuartierProps } from "../types/InterfaceTypes";
import { FaCheck } from "react-icons/fa";
import React from 'react';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import { Delete } from "@mui/icons-material";

const ComparaisonInventaireQuartier:React.FC<ComparaisonInventaireQuartierProps>=(props:ComparaisonInventaireQuartierProps)=>{
    const gestAnnulCalculQuartier=()=>{
        console.log('Annuldation calcul Quartier')
        props.defNouvelInventaireReg([])
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
                        {props.nouvelInventaireReg.map((itemNouvelInventaire)=>(
                            itemNouvelInventaire && (
                                <tr key={itemNouvelInventaire.g_no_lot}>
                                    <td>{itemNouvelInventaire.g_no_lot}</td>
                                    <td>{itemNouvelInventaire.n_places_min}</td>
                                    <td>{itemNouvelInventaire.n_places_max}</td>
                                    <td>{itemNouvelInventaire.id_er}</td>
                                    <td>{itemNouvelInventaire.id_reg_stat}</td>
                                    <td>{props.ancienInventaireReg.find((o)=>((o.g_no_lot===itemNouvelInventaire.g_no_lot)&&(o.methode_estime===itemNouvelInventaire.methode_estime)))?.n_places_min}</td>
                                    <td>{props.ancienInventaireReg.find((o)=>((o.g_no_lot===itemNouvelInventaire.g_no_lot)&&(o.methode_estime===itemNouvelInventaire.methode_estime)))?.n_places_max}</td>
                                    <td>{props.ancienInventaireReg.find((o)=>((o.g_no_lot===itemNouvelInventaire.g_no_lot)&&(o.methode_estime===itemNouvelInventaire.methode_estime)))?.id_er}</td>
                                    <td>{props.ancienInventaireReg.find((o)=>((o.g_no_lot===itemNouvelInventaire.g_no_lot)&&(o.methode_estime===itemNouvelInventaire.methode_estime)))?.id_reg_stat}</td>
                                    <td onClick={() => gestApprouverItem(itemNouvelInventaire.g_no_lot)}><CheckIcon style={{ color: "#FFFFFF" }}/></td>
                                    <td onClick={() => gestAnnulerItem(itemNouvelInventaire.g_no_lot)}><DeleteIcon style={{ color: "#FFFFFF" }}/></td>
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