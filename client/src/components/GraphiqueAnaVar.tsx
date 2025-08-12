import {FC,useState,useEffect} from 'react'
import  { GraphiqueReglementsProps, PropsGraphAnaVar } from '../types/InterfaceTypes'
import { Chart as ChartPlot,Bar,Line } from 'react-chartjs-2';
import { Edit } from '@mui/icons-material';
import { data_graphique, informations_pour_graph_unite_er_reg, utilisation_sol } from '../types/DataTypes';
import { serviceEnsemblesReglements, serviceReglements } from '../services';
import { serviceAnaVariabilite } from '../services/serviceAnaVariabilite';
import serviceUtilisationDuSol from '../services/serviceUtilisationDuSol';
import { FaLevelDownAlt } from 'react-icons/fa';

const GraphiqueAnaVar:FC<PropsGraphAnaVar>=(props:PropsGraphAnaVar)=>{
    const [cubf,defCUBF] = useState<utilisation_sol>({cubf:-1,description:'N/A'})
    const [data,defData] = useState<data_graphique>({
        labels: [0],
        datasets: [{
            label: `N/A`,
            data: [0]
        }],
    })

    const { ensRegAGraph, ensRegReference, index,voirInv } = props;

    useEffect(() => {
        const fetchData = async () => {
            if (ensRegAGraph.length > 0 && ensRegReference !== -1) {
                const [data_in,cubf] = await Promise.all([
                    serviceAnaVariabilite.obtiensInventairesEnsRegs(
                        ensRegAGraph,
                        ensRegReference,
                        index < 9 ? index + 1 : undefined,
                        props.voirInv
                    ),serviceUtilisationDuSol.obtientUtilisationDuSol(index+1,false)
                ]);
                defData(data_in.data);
                if (props.index!==9){
                    defCUBF(cubf.data[0]);
                }else{
                    defCUBF({cubf:0,description:"Tous"})
                }
            } else if (ensRegAGraph.length > 0 ){
                const [data_in,cubf] = await Promise.all([
                    serviceAnaVariabilite.obtiensInventairesEnsRegs(
                        ensRegAGraph,
                        undefined,
                        index < 9 ? index + 1 : undefined,
                        props.voirInv
                    ),serviceUtilisationDuSol.obtientUtilisationDuSol(index+1,false)
                ]);
                defData(data_in.data);
                if (props.index!==9){
                    defCUBF(cubf.data[0]);
                }else{
                    defCUBF({cubf:0,description:"Tous"})
                }
            }
        };
        fetchData();
    }, [ensRegAGraph, ensRegReference, index,voirInv]);
    

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
                stacked: index === 9
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
                stacked: index === 9
            },
        },
    };


    return(<div className="graphique-rendu-ana-var">
        <div className="graphique">
            <Bar
            data={{
                ...data,
                datasets: data.datasets.map((ds, i) => {
                return {
                    ...ds,
                    color: props.colorPalette[ds.cubf ?? index],
                    backgroundColor:props.colorPalette[ds.cubf ?? index]
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
                        const value = context.parsed.y;

                        let label = '';
                        if (props.ensRegReference!==-1) {
                            label = `Indice pour ${context.label}par rapport à référence (100): ${value.toFixed(2)}`;
                        }else {
                            label = `${ds.label}: ${value.toFixed(2)} places`;
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