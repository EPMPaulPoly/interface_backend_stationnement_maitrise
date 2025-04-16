import {AnalysePAVQuartierProps} from '../types/InterfaceTypes'
import React,{useState,useEffect} from 'react';
import {Bar} from 'react-chartjs-2'
import { PAVQuartier, quartiers_analyse,entreePAV } from '../types/DataTypes';
import { serviceQuartiersAnalyse , servicePAV} from '../services';

const AnalyseProfilAccumulationVehiculeQuartiers:React.FC<AnalysePAVQuartierProps>=(props:AnalysePAVQuartierProps)=>{
    const [quartierSelect,defQuartierSelect] = useState<number>(-1);
    const [quartierOptions,defQuartierOptions] = useState<quartiers_analyse[]>([]);
    const [PAVvalide,defPAVvalide] = useState<boolean>(false);
    const [PAVQuartier,defPAVQuartier] = useState<PAVQuartier>({id_quartier:-1,capacite_stat_quartier:0,PAV:[],nom_quartier:''});
    const [PAVNouveau,defPAVNouveau] = useState<entreePAV[]>([]);
    const [PAVCalcule,defPAVCalcule] = useState<boolean>(false)

    useEffect(() => {
            const fetchData = async () => {
                const quartiers = await serviceQuartiersAnalyse.chercheTousQuartiersAnalyse();
                defQuartierOptions(quartiers.data);
            };
            fetchData();
        }, []);
       

    const gestSelectQuartier=(id_quartier:number)=>{
        defQuartierSelect(id_quartier)
    }

    const gestObtientPAV=async()=>{
        const resultat = await servicePAV.obtientPAVQuartier(props.prioriteInventairePossibles.find((ordre)=> ordre.idPriorite=== props.prioriteInventaire)?.listeMethodesOrdonnees??[1,3,2],quartierSelect)
        defPAVQuartier(resultat.data)
        defPAVvalide(true)
    }
    const gestAnnulPAV=()=>{
        defPAVNouveau([])
        defPAVCalcule(false)
    }
    const gestSauvegardePAV=async()=>{
        console.log("servicePAV full object:", servicePAV);
        console.log("typeof servicePAV.sauvegardePAV:", typeof servicePAV.sauvegardePAV);
        const result = await servicePAV.sauvegardePAV(Number(PAVQuartier.id_quartier),PAVNouveau)
        if (result){
            const PAV = await servicePAV.obtientPAVQuartier(props.prioriteInventairePossibles.find((ordre)=> ordre.idPriorite=== props.prioriteInventaire)?.listeMethodesOrdonnees??[1,3,2],PAVQuartier.id_quartier)
            defPAVQuartier(PAV.data)
            defPAVNouveau([])
            defPAVCalcule(false)
        }
    }
    const gestCalculPAV=async()=>{
        const resultPAVActuel = await servicePAV.obtientPAVQuartier(props.prioriteInventairePossibles.find((ordre)=> ordre.idPriorite=== props.prioriteInventaire)?.listeMethodesOrdonnees??[1,3,2],quartierSelect)
        const resultatPAVNouveau = await servicePAV.recalculePAVQuartier(quartierSelect)
        defPAVvalide(true)
        defPAVCalcule(true)
        defPAVQuartier(resultPAVActuel.data)
        defPAVNouveau(resultatPAVNouveau.data)
        console.log('obtientCalculs')
    }
    const renduGraphique=()=>{
        if (PAVvalide && PAVQuartier.PAV.length>0 && !PAVCalcule){
            return (
                <Bar
                    data={{
                        // Name of the variables on x-axies for each bar
                        labels: PAVQuartier.PAV.map((item)=>item.heure),
                        datasets: [
                            {
                                // Label for bars
                                label: "N vehicules",
                                // Data or value of your each variable
                                data: PAVQuartier.PAV.map((item)=>item.voitures),
                                borderWidth: 0.5,
                                backgroundColor:'cyan'
                            },
                        ],
                    }}
                    options={{ responsive: true, maintainAspectRatio: false }}
                />
            )
        } else if(PAVCalcule){
            const lenPAVOld = PAVQuartier.PAV.length
            const lenPAVNew = PAVNouveau.length 
            let heures
            if (lenPAVOld>lenPAVNew){
                heures = PAVQuartier.PAV.map((item)=>item.heure)
            } else {
                heures = PAVNouveau.map((item)=>item.heure)
            }
            return (
                <Bar
                    data={{
                        // Name of the variables on x-axies for each bar
                        labels: heures,
                        datasets: [
                            {
                                // Label for bars
                                label: "N vehicules Ancien",
                                // Data or value of your each variable
                                data: heures.map((item)=>PAVQuartier.PAV.find((itemPAV)=>itemPAV.heure===item)?.voitures??0),
                                borderWidth: 0.5,
                                backgroundColor:'cyan'
                            },
                            {
                                label: "N vehicules Nouveau",
                                data: heures.map((item)=>PAVNouveau.find((itemPAV)=>itemPAV.heure===item)?.voitures??0),
                                backgroundColor:'red'
                            }
                        ],
                    }}
                    options={{ responsive: true, maintainAspectRatio: false }}
                />
            )
        } else{
            return (<></>)
        }
    }

    return(
    <div className={"conteneur-PAV"}>
        <div className="menu-selection-couleur">
            <label htmlFor="select-map-color">SelectionnerQuartier</label>
            <select id="select-map-color" name="select-type" onChange={e => gestSelectQuartier(Number(e.target.value))} value={quartierSelect}>
                <option value={-1}>Selection quartier</option>
                {quartierOptions.map(quartier=>(
                    <option key={quartier.id_quartier} value={quartier.id_quartier} >
                        {quartier.nom_quartier}
                    </option>
                ))}
            </select>
            {quartierSelect!==-1?<button onClick={gestObtientPAV}>Obtenir PAV</button>:<></>}
            {quartierSelect!==-1?<button onClick={gestCalculPAV}>Recalculer PAV</button>:<></>}
            {PAVCalcule?<><button onClick={gestSauvegardePAV}>Approuver PAV</button><button onClick={gestAnnulPAV}>Refuser PAV</button></>:<></>}
        </div>
        <div className={"PAV"}>
            {renduGraphique()}
        
        </div>
    </div>
    )
}

export default AnalyseProfilAccumulationVehiculeQuartiers;