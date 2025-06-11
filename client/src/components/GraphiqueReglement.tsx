import {FC,useState,useEffect} from 'react'
import  { GraphiqueReglementsProps } from '../types/InterfaceTypes'
import { Chart as ChartPlot,Bar,Line } from 'react-chartjs-2';
import { Edit } from '@mui/icons-material';
import ModalManipulationGraphiqueReg from './modalManipulationGraphiqueReg';
import { data_graphique, utilisation_sol } from '../types/DataTypes';

const GraphiqueReglements:FC<GraphiqueReglementsProps>=(props:GraphiqueReglementsProps)=>{
    const [modalParamsGraphOuvert,defModalParamsGraphOuvert] = useState<boolean>(false)
    const [CUBFSelectionne,defCUBFSelectionne] = useState<utilisation_sol>({cubf:-1,description:'N/A'})
    const [data,defData] = useState<data_graphique>({
        labels: [0],
        datasets: [{
            label: `N/A`,
            data: [0]
        }],
    })
    const [labelAxeX,defLabelAxeX] = useState<string>('N/A')

    const options = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: 'white',
                    font: {
                        size: 16,
                    },
                },
            },
            title: {
                display: true,
                text: CUBFSelectionne.cubf !== -1 ? CUBFSelectionne.description : 'N/A',
                color:'white',
                font:{
                    size:25
                }
            },
        },
        scales: {
            x: {
                ticks: {
                    color: 'white',
                    font: {
                        size: 16,
                    },
                },
                title: {
                    display: true,
                    text: labelAxeX,
                    color: 'white',
                    font: {
                        size: 18,
                    },
                },
            },
            y: {
                ticks: {
                    color: 'white',
                    font: {
                        size: 16,
                    },
                },
                title: {
                    display: true,
                    text: 'Nombre de places',
                    color: 'white',
                    font: {
                        size: 18,
                    },
                },
            },
        },
    };


    return(<div className="graphique-rendu-reglements">
        <div className="graph-control"><Edit onClick={()=>defModalParamsGraphOuvert(true)}/> Éditer Paramètres graph</div>
        <div className="graphique">
            <Line
                data={{
                    ...data,
                    datasets: data.datasets.map((ds, i) => ({
                    ...ds,
                    borderColor: `hsl(${(i * 60) % 360}, 90%, 50%)`,
                    backgroundColor: `hsl(${(i * 60) % 360}, 90%, 70%)`
                    })),
                }}
                options={options}
            />
        </div>
        <ModalManipulationGraphiqueReg
            modalOuvert={modalParamsGraphOuvert}
            defModalOuvert={defModalParamsGraphOuvert}
            CUBFSelect={CUBFSelectionne}
            defCUBFSelect={defCUBFSelectionne}
            ensRegAVis={props.ensembleReglementsARepresenter}
            data = {data}
            defData = {defData}
            defLabelAxeX = {defLabelAxeX}
        />
    </div>)
}
export default GraphiqueReglements;