import {FC,useState,useEffect} from 'react'
import  { GraphiqueReglementsProps, PropsGraphAnaVar } from '../types/InterfaceTypes'
import { Chart as ChartPlot,Bar,Line } from 'react-chartjs-2';
import { Edit } from '@mui/icons-material';
import { data_graphique, informations_pour_graph_unite_er_reg, utilisation_sol } from '../types/DataTypes';
import { serviceEnsemblesReglements, serviceReglements } from '../services';
import { serviceAnaVariabilite } from '../services/serviceAnaVariabilite';
import serviceUtilisationDuSol from '../services/serviceUtilisationDuSol';

const GraphiqueAnaVar:FC<PropsGraphAnaVar>=(props:PropsGraphAnaVar)=>{
    const [cubf,defCUBF] = useState<utilisation_sol>({cubf:-1,description:'N/A'})
    const [data,defData] = useState<data_graphique>({
        labels: [0],
        datasets: [{
            label: `N/A`,
            data: [0]
        }],
    })

    const { ensRegAGraph, ensRegReference, index } = props;

    useEffect(() => {
        const fetchData = async () => {
            if (ensRegAGraph.length > 0 && ensRegReference !== -1) {
                const [data_in] = await Promise.all([
                    serviceAnaVariabilite.obtiensInventairesEnsRegs(
                        ensRegAGraph,
                        ensRegReference,
                        index + 1
                    )
                ]);
                defData(data_in.data);
            } else if (ensRegAGraph.length > 0 ){
                const [data_in] = await Promise.all([
                    serviceAnaVariabilite.obtiensInventairesEnsRegs(
                        ensRegAGraph,
                        undefined,
                        index + 1
                    )
                ]);
                defData(data_in.data);
            }
        };
        fetchData();
    }, [ensRegAGraph, ensRegReference, index]);
    

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
                text: cubf.cubf !== -1 ? cubf.description : 'N/A',
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
                    text: 'Ensemble de règlement',
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
                    text: (props.ensRegReference !== -1 ? 'Indice (100 = ER de référence)' : 'Places de stationnement'),
                    color: 'white',
                    font: {
                        size: 18,
                    },
                },
            },
        },
    };


    return(<div className="graphique-rendu-ana-var">
        <div className="graphique">
            <Bar
            data={{
                ...data,
                datasets: data.datasets.map((ds, i) => {
                // Find the matching reglement by id_er
                const reglement = props.ensRegAGraph.find(r => r === ds.id_er);
                // Get color from palette by index or fallback
                const colorIndex = reglement ? props.ensRegAGraph.indexOf(reglement) : i;
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
                        const reglement = props.ensRegAGraph.find(r => r === ds.id_er);
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
    </div>)
}
export default GraphiqueAnaVar;