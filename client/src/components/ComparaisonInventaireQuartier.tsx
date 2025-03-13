import { ComparaisonInventaireQuartierProps } from "../types/InterfaceTypes";
import { FaCheck } from "react-icons/fa";
import React from 'react';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import { Delete } from "@mui/icons-material";
import { inventaire_stationnement } from "../types/DataTypes";
import { serviceInventaire } from "../services";

const ComparaisonInventaireQuartier:React.FC<ComparaisonInventaireQuartierProps>=(props:ComparaisonInventaireQuartierProps)=>{
    const gestAnnulCalculQuartier=()=>{
        console.log('Annuldation calcul Quartier')
        props.defNouvelInventaireReg([])
        props.defValidationInventaireQuartier(false)
    }
    const gestAnnulerItem=(noLot:string)=>{
        const nouvelNouvelInventaire = props.nouvelInventaireReg.filter((o)=>o.g_no_lot!== noLot)
        props.defNouvelInventaireReg(nouvelNouvelInventaire)
        console.log('annulation item',noLot)
    }
    const gestApprouverItem= async(noLot:string)=>{
        console.log('A implementer - get approuver item')
        const ancienItem= props.ancienInventaireReg.find((o)=>o.g_no_lot===noLot && o.methode_estime===2)
        const nouvelItem = props.nouvelInventaireReg.find((o)=>o.g_no_lot===noLot && o.methode_estime===2)
        if (ancienItem){
            const itemAinserer:inventaire_stationnement={
                g_no_lot:nouvelItem?.g_no_lot||'',
                n_places_min:nouvelItem?.n_places_min||0,
                n_places_max:nouvelItem?.n_places_max||0,
                n_places_estime:nouvelItem?.n_places_estime||0,
                n_places_mesure:nouvelItem?.n_places_mesure||0,
                id_er:nouvelItem?.id_er||'',
                id_reg_stat:nouvelItem?.id_reg_stat||'',
                commentaire:nouvelItem?.commentaire||'',
                methode_estime:nouvelItem?.methode_estime||2,
                cubf:nouvelItem?.cubf||'',
                id_inv:null
            }
            const idMAJ = ancienItem.id_inv;
            const reussi = await serviceInventaire.modifieInventaire(idMAJ,itemAinserer)
            if (reussi){
                const nouvelNouvelInventaire = props.nouvelInventaireReg.filter((o)=>o.g_no_lot!== noLot)
                props.defNouvelInventaireReg(nouvelNouvelInventaire)
            } else{
                alert('sauvegarde non réussie')
            }
        } else{
            const itemAinserer:Omit<inventaire_stationnement,'id_inv'>={
                g_no_lot:nouvelItem?.g_no_lot||'',
                n_places_min:nouvelItem?.n_places_min||0,
                n_places_max:nouvelItem?.n_places_max||0,
                n_places_estime:nouvelItem?.n_places_estime||0,
                n_places_mesure:nouvelItem?.n_places_mesure||0,
                id_er:nouvelItem?.id_er||'',
                id_reg_stat:nouvelItem?.id_reg_stat||'',
                commentaire:nouvelItem?.commentaire||'',
                methode_estime:nouvelItem?.methode_estime||2,
                cubf:nouvelItem?.cubf||'',
            }
            const reussi = await serviceInventaire.nouvelInventaire(itemAinserer)
            if (reussi){
                const nouvelNouvelInventaire = props.nouvelInventaireReg.filter((o)=>o.g_no_lot!== noLot)
                props.defNouvelInventaireReg(nouvelNouvelInventaire)
            } else{
                alert('sauvegarde non réussie')
            }
        }
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
            <table>
                <tr>
                    <td className="old">old is gold</td>
                    <td className="new">blue is new</td>
                    <td className="difference">Red is change</td>
                    <td>Montre seulement les résultats montrant un changement à l'inventaire actuel</td>
                </tr>
            </table>
            <div className="conteneur-table-comparaison-quartier">
                <table className="table-comparaison-inventaire-quartier">
                    <thead>
                        <tr>
                            <th></th>
                            <th colSpan={5}>Ancien Inventaire</th>
                            <th colSpan={4}>Nouvel Inventaire</th>
                            <th></th>
                            <th></th>
                        </tr>
                        <tr>
                            <th>Lot</th>
                            <th>ID Inv</th>
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
                                    <td className="old">{props.ancienInventaireReg.find((o)=>((o.g_no_lot===itemNouvelInventaire.g_no_lot)&&(o.methode_estime===itemNouvelInventaire.methode_estime)))?.id_inv}</td>
                                    <td className="old">{props.ancienInventaireReg.find((o)=>((o.g_no_lot===itemNouvelInventaire.g_no_lot)&&(o.methode_estime===itemNouvelInventaire.methode_estime)))?.n_places_min}</td>
                                    <td className="old">{props.ancienInventaireReg.find((o)=>((o.g_no_lot===itemNouvelInventaire.g_no_lot)&&(o.methode_estime===itemNouvelInventaire.methode_estime)))?.n_places_max}</td>
                                    <td className="old">{props.ancienInventaireReg.find((o)=>((o.g_no_lot===itemNouvelInventaire.g_no_lot)&&(o.methode_estime===itemNouvelInventaire.methode_estime)))?.id_er}</td>
                                    <td className="old">{props.ancienInventaireReg.find((o)=>((o.g_no_lot===itemNouvelInventaire.g_no_lot)&&(o.methode_estime===itemNouvelInventaire.methode_estime)))?.id_reg_stat}</td>
                                    <td className={props.ancienInventaireReg.find((o) => (o.g_no_lot === itemNouvelInventaire.g_no_lot && o.methode_estime === itemNouvelInventaire.methode_estime))?.n_places_min !== itemNouvelInventaire.n_places_min ? 'difference' : 'new'}>{itemNouvelInventaire.n_places_min}</td>
                                    <td className={props.ancienInventaireReg.find((o) => (o.g_no_lot === itemNouvelInventaire.g_no_lot && o.methode_estime === itemNouvelInventaire.methode_estime))?.n_places_max !== itemNouvelInventaire.n_places_max ? 'difference' : 'new'}>{itemNouvelInventaire.n_places_max}</td>
                                    <td className={props.ancienInventaireReg.find((o) => (o.g_no_lot === itemNouvelInventaire.g_no_lot && o.methode_estime === itemNouvelInventaire.methode_estime))?.id_er !== itemNouvelInventaire.id_er ? 'difference' : 'new'}>{itemNouvelInventaire.id_er}</td>
                                    <td className={props.ancienInventaireReg.find((o) => (o.g_no_lot === itemNouvelInventaire.g_no_lot && o.methode_estime === itemNouvelInventaire.methode_estime))?.id_reg_stat !== itemNouvelInventaire.id_reg_stat ? 'difference' : 'new'}>{itemNouvelInventaire.id_reg_stat}</td>
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