import { AnalyseHistoQuartierProps } from '../types/InterfaceTypes'
import React, { useState, useEffect } from 'react';
import { Chart as ChartPlot,Bar } from 'react-chartjs-2'
import { PAVQuartier, quartiers_analyse, entreePAV, barChartDataSet } from '../types/DataTypes';
import { serviceQuartiersAnalyse, servicePAV } from '../services';
import { yellow } from '@mui/material/colors';
import { Chart, registerables } from 'chart.js';
import { GeoJSONPropsAnaQuartier,TypesAnalysesCartographiqueQuartier } from '../types/AnalysisTypes';
import { circle } from 'leaflet';
import { barChartData } from '../types/DataTypes';
import { serviceAnalyseInventaire } from '../services/serviceAnalyseInventaire';
import { Feature, FeatureCollection,Geometry } from 'geojson';

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
        switch (variableSelect){
            case 0: return options.find((item)=>item.idAnalyseCarto===0)?.descriptionAnalyseCarto
            case 1: return options.find((item)=>item.idAnalyseCarto===1)?.descriptionAnalyseCarto
            case 2: return options.find((item)=>item.idAnalyseCarto===2)?.descriptionAnalyseCarto
            case 3: return options.find((item)=>item.idAnalyseCarto===3)?.descriptionAnalyseCarto
            case 4: return options.find((item)=>item.idAnalyseCarto===3)?.descriptionAnalyseCarto
            default: return ''
        }
             
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
        switch (variableSelect) {
            case 0:
                HistoRep = await serviceAnalyseInventaire.obtientInventaireAgregeParQuartierHisto(props.prioriteInventairePossibles.find((ordre)=> ordre.idPriorite=== props.prioriteInventaire)?.listeMethodesOrdonnees??[1,3,2])
                break;
            case 1:
                HistoRep = await serviceAnalyseInventaire.obtientInventaireAgregeParQuartierParSuperfHisto(props.prioriteInventairePossibles.find((ordre)=> ordre.idPriorite=== props.prioriteInventaire)?.listeMethodesOrdonnees??[1,3,2])
                break;
            case 2:
                HistoRep = await serviceAnalyseInventaire.obtientInventaireAgregeParQuartierPlacesParVoitureHisto(props.prioriteInventairePossibles.find((ordre)=> ordre.idPriorite=== props.prioriteInventaire)?.listeMethodesOrdonnees??[1,3,2])
                break;
            case 3:
                HistoRep = await serviceAnalyseInventaire.obtientInventaireAgregeParQuartierPlacesParPersonneHisto(props.prioriteInventairePossibles.find((ordre)=> ordre.idPriorite=== props.prioriteInventaire)?.listeMethodesOrdonnees??[1,3,2])
                break;
            case 4:
                HistoRep = await serviceAnalyseInventaire.obtientInventaireAgregeParQuartierPourcentTerritoireHisto(props.prioriteInventairePossibles.find((ordre)=> ordre.idPriorite=== props.prioriteInventaire)?.listeMethodesOrdonnees??[1,3,2])
                break;
            default:
                HistoRep = {success:false,data:{valeurVille:0,description:'',donnees:[]}}; 
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
                    {options.map(variable => (
                        <option key={variable.idAnalyseCarto} value={variable.idAnalyseCarto} >
                            {variable.descriptionAnalyseCarto}
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