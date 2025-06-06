import {FC,useState,useEffect} from 'react'
import  { GraphiqueReglementsProps } from '../types/InterfaceTypes'
import { Chart as ChartPlot,Bar,Line } from 'react-chartjs-2';
import { Edit } from '@mui/icons-material';
import ModalManipulationGraphiqueReg from './modalManipulationGraphiqueReg';
import { utilisation_sol } from '../types/DataTypes';

const GraphiqueReglements:FC<GraphiqueReglementsProps>=(props:GraphiqueReglementsProps)=>{
    const [modalParamsGraphOuvert,defModalParamsGraphOuvert] = useState<boolean>(false)
    const [CUBFSelectionne,defCUBFSelectionne] = useState<utilisation_sol>({cubf:-1,description:'N/A'})
    const data = {
        labels: props.ensembleReglementsARepresenter.map((r) => `Reg ${r}`),
        datasets: [{
            label: `Règlements`,
            data: props.ensembleReglementsARepresenter.map((_, i) => i + 1)
        }],
    };
    const options = {
        maintainAspectRatio: false, // This lets the chart stretch to fill container
        // ...other options
    };


    return(<div className="graphique-rendu-reglements">
        <div className="graph-control"><Edit onClick={()=>defModalParamsGraphOuvert(true)}/> Éditer Paramètres graph</div>
        <div className="graphique">
            <Line data={data} options={options}/>
        </div>
        <ModalManipulationGraphiqueReg
            modalOuvert={modalParamsGraphOuvert}
            defModalOuvert={defModalParamsGraphOuvert}
            CUBFSelect={CUBFSelectionne}
            defCUBFSelect={defCUBFSelectionne}
            ensRegAVis={props.ensembleReglementsARepresenter}
        />
    </div>)
}
export default GraphiqueReglements;