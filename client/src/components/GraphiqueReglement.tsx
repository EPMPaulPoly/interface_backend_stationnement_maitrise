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
                datasets: data.datasets.map((ds, i) => {
                // Find the matching reglement by id_er
                const reglement = props.ensembleReglementsARepresenter.find(r => r === ds.id_er);
                // Get color from palette by index or fallback
                const colorIndex = reglement ? props.ensembleReglementsARepresenter.indexOf(reglement) : i;
                const color = props.colorPalette[colorIndex % props.colorPalette.length] || '#cccccc';
                return {
                    ...ds,
                    borderColor: color,
                    backgroundColor: color + '80', // add alpha for background
                };
                }),
            }}
            options={{
                ...options,
                plugins: {
                ...options.plugins,
                tooltip: {
                    callbacks: {
                    label: function(context: any) {
                        const ds = context.dataset;
                        // Find reglement by id_er
                        const reglement = props.ensembleReglementsARepresenter.find(r => r === ds.id_er);
                        // Try to get desc_er and desc_reg_stat if available
                        const desc_er = ds?.desc_er || '';
                        const desc_reg_stat = ds?.desc_reg_stat || '';
                        const value = context.parsed.y;
                        let label = '';
                        if (desc_er && desc_reg_stat) {
                            label = `${desc_er} (${desc_reg_stat}): ${value} places`;
                        } else if (desc_er) {
                            label = `${desc_er}: ${value} places`;
                        } else {
                            label = `${ds.label}: ${value} places`;
                        }
                        return label;
                    }
                    }
                }
                }
            }}
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