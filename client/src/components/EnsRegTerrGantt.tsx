import React,{useState} from 'react';
import { association_territoire_entete_ensemble_reglement, entete_ensembles_reglement_stationnement } from '../types/DataTypes';
import { EnsRegTerrDispTable } from '../types/InterfaceTypes';
import DeleteIcon from '@mui/icons-material/Delete'
import CancelIcon from '@mui/icons-material/Cancel';
import { Add, Cancel, Edit, Save } from '@mui/icons-material';
import { serviceEnsemblesReglements } from '../services';

const EnsRegTerrGantt:React.FC<EnsRegTerrDispTable> =(props:EnsRegTerrDispTable) =>{

    const [idAssociationEditee,defIdAssociationEditee] = useState<number>(-1);
    const [editionEnCours,defEditionEnCours] = useState<boolean>(false);
    const [entetesEnsembles,defEntetesEnsembles] = useState<entete_ensembles_reglement_stationnement[]>([]);
    const [idEnteteSelectionnee,defIdEnteteSelectionnee] = useState<number>(-1);
    const [ancienAssoDispo,defAncienAssoDispo] = useState<association_territoire_entete_ensemble_reglement[]>([])
    const getYearSpan = (): number[] => {
        const years = [];
        let startYear = 1950;
        let endYear = new Date().getFullYear();
        if (props.periodeSelect.id_periode!=-1){
            if (props.periodeSelect.date_debut_periode!=0){
                startYear = props.periodeSelect.date_debut_periode;
            }
            if (props.periodeSelect.date_fin_periode!=null){
                endYear = props.periodeSelect.date_fin_periode;
            }
        }
        for (let year = startYear; year <= endYear; year++) {
            years.push(year);
        }
        return years;
        
    };


    const displayYears = getYearSpan();

    const gestAjoutLigne = async()=>{
        const ensemblesReglementsRep = await serviceEnsemblesReglements.chercheTousEntetesEnsemblesReglements()
        const ensemblesReglements:entete_ensembles_reglement_stationnement[] = ensemblesReglementsRep.data
        defAncienAssoDispo(props.ensRegDispo);
        defEditionEnCours(true);
        defIdAssociationEditee(-1);
        const premierEnsReg = Math.min(...Array.from(new Set(ensemblesReglements.map((o)=>o.id_er))))
        defIdEnteteSelectionnee(premierEnsReg)
        defEntetesEnsembles(ensemblesReglements)
        const enteteSelectionnee = ensemblesReglements.find((o)=>o.id_er === premierEnsReg)!;
        const ligneAjouter: association_territoire_entete_ensemble_reglement = {
            id_asso_er_ter: -1,
            id_periode_geo: props.territoireSelect.features[0].properties.id_periode_geo,
            id_er: enteteSelectionnee.id_er,
            date_debut_er: enteteSelectionnee.date_debut_er,
            date_fin_er: enteteSelectionnee.date_fin_er,
            description_er: enteteSelectionnee.description_er
        };
        const nouvelEnsemblesDispos:association_territoire_entete_ensemble_reglement[] = [...props.ensRegDispo,ligneAjouter]
        props.defEnsRegDispo(nouvelEnsemblesDispos)
    }

    const gestSelectEnsReg = async(idEnsembleSelect:number)=>{
        defIdEnteteSelectionnee(idEnsembleSelect)
    }
    const gestAnnulation = ()=>{
        props.defEnsRegDispo(ancienAssoDispo)
        defEditionEnCours(false);
        defIdAssociationEditee(-1);
        defAncienAssoDispo([]);
    }

    const gestEditionLigne = async(idAssoc:number)=>{
        // Si il y a un ancien, on met a jour la valeur pour revenir à l'ancien. Permet de commencer a éditer une ligne en période de création
        if (ancienAssoDispo.length>0){
            props.defEnsRegDispo(ancienAssoDispo)
        } else{// Si ce n'est pas le cas, on prend la liste actuelle comme valeur à rétablir
            defAncienAssoDispo(props.ensRegDispo)
        }
        defEditionEnCours(true)
        defIdAssociationEditee(idAssoc)
    }
    return(
        <div className="gantt-ens-reg-terr">
            <table className="table-vis-assoc-terr-ens-reg">
                <thead>
                    <tr>
                        <th className="save-edit sticky-col"></th>
                        <th className="cancel-delete sticky-col"></th>
                        <th className="asso-id-col sticky-col">ID Asso</th>
                        <th className="id-col sticky-col">ID ER</th>
                        <th className="desc-col sticky-col">Description</th>
                        <th className="start-col sticky-col">Annee Deb</th>
                        <th className="end-col sticky-col">Annee Fin</th>
                        {displayYears.map((item) => (<th><div className="year-header">{item}</div></th>))}
                    </tr>
                </thead>
                <tbody>
                    {props.ensRegDispo.map((association)=>(
                        <tr>
                            <td className="save-edit sticky-col">{editionEnCours&& idAssociationEditee===association.id_asso_er_ter?<Save/>:<Edit onClick={()=>gestEditionLigne(association.id_asso_er_ter)}/>}</td>
                            <td className="cancel-delete sticky-col">{editionEnCours&& idAssociationEditee===association.id_asso_er_ter?<Cancel onClick={gestAnnulation}/>:<DeleteIcon/>}</td>
                            <td className="asso-id-col sticky-col">{association.id_asso_er_ter}</td>
                            <td className="id-col sticky-col">{
                                editionEnCours && idAssociationEditee===association.id_asso_er_ter ?
                                entetesEnsembles.find((enteteSelect)=>enteteSelect.id_er===idEnteteSelectionnee)?.id_er??'N/A'
                                :
                                association.id_er}</td>
                            <td className="desc-col sticky-col">{
                                editionEnCours && idAssociationEditee===association.id_asso_er_ter ?
                                    <select onChange={(e)=>gestSelectEnsReg(Number(e.target.value))}>{
                                        entetesEnsembles.map((ensemble)=>
                                        <option key={ensemble.id_er} value={ensemble.id_er}>{ensemble.description_er}</option>)}
                                    </select>
                                    :
                                    association.description_er}
                            </td>
                            <td className="start-col sticky-col">{
                                editionEnCours && idAssociationEditee===association.id_asso_er_ter ?
                                entetesEnsembles.find((enteteSelect)=>enteteSelect.id_er===idEnteteSelectionnee)?.date_debut_er??'N/A'
                                :
                                association.date_debut_er}
                            </td>
                            <td className="end-col sticky-col">{
                                editionEnCours && idAssociationEditee===association.id_asso_er_ter ?
                                entetesEnsembles.find((enteteSelect)=>enteteSelect.id_er===idEnteteSelectionnee)?.date_fin_er??'N/A'
                                :
                                association.date_fin_er}</td>
                            {displayYears.map((annee)=>(
                                editionEnCours && idAssociationEditee===association.id_asso_er_ter ?<td className="annee-invalide"></td>:
                                ((annee>=association.date_debut_er || association.date_debut_er===null) && (annee<=association.date_fin_er || association.date_fin_er===null))?<td className="annee-valide">x</td> :<td className="annee-invalide"></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {props.territoireSelect.features.length>0 && editionEnCours===false ?<p><Add onClick={gestAjoutLigne}/> Ajouter Ensemble de règlements à ce territoire</p>:<></>}
        </div>
    )
}

export default EnsRegTerrGantt;