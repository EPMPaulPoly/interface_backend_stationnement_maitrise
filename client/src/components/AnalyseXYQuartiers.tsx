import React,{useState} from 'react';
import { AnalyseXYQuartierProps } from '../types/InterfaceTypes';
import {VariablesPossiblesGraphiqueXY} from '../types/AnalysisTypes';

const AnalyseXYQuartiers:React.FC<AnalyseXYQuartierProps>=(props:AnalyseXYQuartierProps)=>{
    const [variableSelectX,defVariableSelectX] = useState<number>(-1);
    const [variableSelectY,defVariableSelectY] = useState<number>(-1);
    const [calculEnCours,defCalculEncours] = useState<boolean>(false);
    const variablesPotentielles:VariablesPossiblesGraphiqueXY[] = [
        {
            idVariable:0,
            descriptionVariable:'Stationnement Total'
        },
        {
            idVariable:1,
            descriptionVariable:'Stationnement par mètre carré'
        },
        {
            idVariable:2,
            descriptionVariable:'Stationnement par personne'
        },
        {
            idVariable:3,
            descriptionVariable:'Stationnement par voiture résident'
        },
        {
            idVariable:4,
            descriptionVariable:'Pourcentage territoire'
        },
        {
            idVariable:5,
            descriptionVariable:'Superficie Quartier'
        }
    ];
    const gestSelectVariable=(targetValue:number,axis:string)=>{
        switch(axis){
            case 'X':
                defVariableSelectX(targetValue);
                break;
            case 'Y':
                defVariableSelectY(targetValue);
                break;
            default:
                console.log('invalid variable name')
        }
    };
    const gestObtientVariables = async()=>{

    };
    const gestRecalculeVariablesAncillaires = async()=>{

    };
    const renduGraphique = () =>{
        return(<></>)
    }
    return(<div className={"conteneur-xy"}>
        <div className="menu-selection-variable">
            <label htmlFor="select-variable-X">Selectionner Variable X </label>
            <select id="select-variable-X" name="select-variable-X" onChange={e => gestSelectVariable(Number(e.target.value),'X')} value={variableSelectX}>
                <option value={-1}>Selection variable</option>
                {variablesPotentielles.map(variable => (
                    <option key={variable.idVariable} value={variable.idVariable} >
                        {variable.descriptionVariable}
                    </option>
                ))}
            </select>
            <label htmlFor="select-variable-Y">Selectionner Variable Y </label>
            <select id="select-variable-Y" name="select-variable-Y" onChange={e => gestSelectVariable(Number(e.target.value),'Y')} value={variableSelectY}>
                <option value={-1}>Selection variable Y</option>
                {variablesPotentielles.map(variable => (
                    <option key={variable.idVariable} value={variable.idVariable} >
                        {variable.descriptionVariable}
                    </option>
                ))}
            </select>
            {(variableSelectX !== -1) && (variableSelectY!== -1) ? <button onClick={gestObtientVariables}>Obtenir Données</button> : <></>}
            <button onClick={gestRecalculeVariablesAncillaires}>Recalculer variables ancillaires</button>
        </div>
        <div className={"graphxy"}>
            {renduGraphique()}

        </div>
    </div>)
}

export default AnalyseXYQuartiers;