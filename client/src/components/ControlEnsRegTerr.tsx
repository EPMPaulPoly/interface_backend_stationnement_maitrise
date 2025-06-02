import React,{useState} from 'react';
import { EnsRegTerrControlProps } from '../types/InterfaceTypes';
import { serviceEnsemblesReglements, serviceTerritoires } from '../services';
import { serviceEnsRegTerr } from '../services/serviceEnsRegTerr';


const ControlEnsRegTerr:React.FC<EnsRegTerrControlProps> = (props:EnsRegTerrControlProps) =>{

    const [ddSelectedValue,defddSelectedValue] = useState(-1);
    const [ddPerSelectedValue,defddPerSelectedValue] = useState(-1);
    const gestSelectionPeriode = async (periodeAChanger:number)=>{
        if (periodeAChanger!=-1){
            const territoires = await serviceTerritoires.chercheTerritoiresParPeriode(periodeAChanger)
            props.defTerritoireDispo(territoires.data)
            const periodeSelect =props.periodesDispo.find((o) => (o.id_periode === periodeAChanger)); 
            props.defPeriodeSelect(periodeSelect)
            const territoireSelect = {type:'FeatureCollection',features:[]}
            props.defTerritoireSelect(territoireSelect)
            defddSelectedValue(-1)
            props.defEnsRegDispo([])
            defddPerSelectedValue(periodeAChanger)
        }else{
            defddSelectedValue(-1)
            props.defEnsRegDispo([])
            defddPerSelectedValue(periodeAChanger)
            const territoires = {type:'FeatureCollection'as const,features:[] as never[]}
            props.defTerritoireDispo(territoires)
            const territoireSelect = {type:'FeatureCollection',features:[]}
            props.defTerritoireSelect(territoireSelect)
        }
    };

    const gestSelectionTerritoire = async(territoireAregarder:number)=>{
        if (territoireAregarder!=-1){
            const ensReg = await serviceEnsRegTerr.obtiensEnsRegEtAssocParTerritoire(territoireAregarder)
            const territoireSelectTemp =await serviceTerritoires.chercheTerritoiresParId(territoireAregarder);
            props.defEnsRegDispo(ensReg.data);
            props.defTerritoireSelect(territoireSelectTemp.data);
            defddSelectedValue(territoireAregarder)
        } else{
            defddSelectedValue(territoireAregarder)
            props.defEnsRegDispo([])
        }
        
    }
    return(
        <div className="control-ens-reg-terr-comp">
        <div className="select-periode">
            <label 
                htmlFor="selection-periode" 
                className="label-selection-periode">
                Sélection Période
            </label>
            <select 
            className="selection-periode" 
            value ={ddPerSelectedValue}
            onChange={e => gestSelectionPeriode(Number(e.target.value))}>
                <option value={-1}>Choisir Période</option>
                {props.periodesDispo.map((periode)=>(
                    <option value={periode.id_periode}>{periode.nom_periode}</option>
                ))}
            </select>
        </div>
        <div className="select-territoire">
            <label 
                htmlFor="select-territoire" 
                className="label-select-territoire">
                Sélection Territoire
            </label>
            <select 
            className="select-territoire" 
            value={ddSelectedValue}
            onChange={e=>gestSelectionTerritoire(Number(e.target.value))}>
                <option value={-1}>Selection Territoire</option>
                {props.territoiresDispo.features.map((territoire)=>(
                    <option value= {territoire.properties.id_periode_geo}>{territoire.properties.ville} - {territoire.properties.secteur}</option>
                ))}
            </select>
        </div>
        </div>
    )
}

export default ControlEnsRegTerr;