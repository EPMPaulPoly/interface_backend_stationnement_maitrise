import { AnalyseHistoQuartierProps } from '../types/InterfaceTypes'
import React, { useState } from 'react';
import { Chart as ChartPlot,Bar } from 'react-chartjs-2'
import { barChartDataSet } from '../types/DataTypes';
import { TypesAnalysesCartographiqueQuartier } from '../types/AnalysisTypes';

import { barChartData } from '../types/DataTypes';
import { serviceAnalyseInventaire } from '../services/serviceAnalyseInventaire';

const AnalyseHistogrammeQuartier: React.FC<AnalyseHistoQuartierProps> = (props: AnalyseHistoQuartierProps) => {
    const [variableSelect,defVariableSelect] = useState<number>(-1);
    const [donneesVariables,defDonneesVariables]= useState<barChartDataSet>({valeurVille:0,description:'',donnees:[]});

    const options:TypesAnalysesCartographiqueQuartier[]=[
            {
                idAnalyseCarto: 0,
                descriptionAnalyseCarto: "Stationnement total",
            },
            {
                idAnalyseCarto: 1,
                descriptionAnalyseCarto: "Stationnement par superficie",
            },
            {
                idAnalyseCarto:2,
                descriptionAnalyseCarto: "Stationnement par voiture"
            },
            {
                idAnalyseCarto:3,
                descriptionAnalyseCarto: "Stationnement par habitant"
            },
            {
                idAnalyseCarto:4,
                descriptionAnalyseCarto: "Pourcentage Territoire"
            }
        ];

    

    const obtenirLegendeAxeY =()=>{
        return props.variablesPossibles.find((variable)=> variable.idVariable===variableSelect)?.descriptionVariable??'N/A'
    }

    const renduGraphique = () => {
        if (donneesVariables.donnees.length>0) {
            return (
                <ChartPlot
                    type={'bar'}
                    data={{
                        // Name of the variables on x-axies for each bar
                        labels: donneesVariables.donnees.map((item) => item.nom_quartier),
                        datasets: [
                            {
                                // Label for bars
                                label: donneesVariables.description,
                                // Data or value of your each variable
                                data: donneesVariables.donnees.map((item) => item.valeurs),
                                borderWidth: 0.5,
                                backgroundColor: 'cyan'
                            }
                        ],
                    }}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: {
                                    usePointStyle: true
                                  }
                            },
                            title: {
                                display: true,
                                text: `${donneesVariables.description} - Total Québec: ${donneesVariables.valeurVille.toFixed(2)}`,
                                font: {
                                    size: 30,
                                }
                            },
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Quartier',
                                    font: {
                                        size: 25,
                                    }
                                },
                                ticks:{
                                    font:{
                                        size:20
                                    }
                                },
                                grid: {
                                    display: false,
                                },
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: obtenirLegendeAxeY(),
                                    font: {
                                        size: 20,
                                    }
                                },
                                beginAtZero: true,
                                ticks: {
                                    callback: (value) => `${value}`, // Optional: format Y-axis values
                                }
                            },
                        }
                    }}
                    //plugins={[levelLinePlugin]}
                />
            )
        } else {
            return (<></>)
        }
    };

    const gestCalculMoyennesFoncieres=()=>{
        console.log('a implementer')
    };

    const gestObtientVariable = async() =>{
        let HistoRep;
        if (variableSelect!==-1){
            HistoRep = await serviceAnalyseInventaire.obtientVariableAgregeParQuartierHisto(props.prioriteInventairePossibles.find((ordre)=> ordre.idPriorite=== props.prioriteInventaire)?.listeMethodesOrdonnees??[1,3,2],props.variablesPossibles.find((variable)=>variable.idVariable===variableSelect)?.queryKey??'stat-tot')
        }
        if (HistoRep && HistoRep.success){
            defDonneesVariables(HistoRep.data)
        } else{
            defDonneesVariables({valeurVille:0,description:'',donnees:[]})
        }
    };
    const gestSelectVariable =(idAnalyse:number)=>{
        defVariableSelect(idAnalyse)
    }
    const getShowLine = ():boolean=>{
        return false
    }

    return (
        <div className={"conteneur-histo"}>
            <div className="menu-selection-couleur">
                <label htmlFor="select-variable">Selectionner Variable</label>
                <select id="select-variable" name="select-cariable" onChange={e => gestSelectVariable(Number(e.target.value))} value={variableSelect}>
                    <option value={-1}>Selection variable</option>
                    {props.variablesPossibles.map(variable => (
                        <option key={variable.idVariable} value={variable.idVariable} >
                            {variable.descriptionVariable}
                        </option>
                    ))}
                </select>
                {variableSelect !== -1 ? <button onClick={gestObtientVariable}>Obtenir Données</button> : <></>}
                <button onClick={gestCalculMoyennesFoncieres}>Recalculer moyennes foncières</button>
            </div>
            <div className={"histo"}>
                {renduGraphique()}

            </div>
        </div>
    )
}

export default AnalyseHistogrammeQuartier;