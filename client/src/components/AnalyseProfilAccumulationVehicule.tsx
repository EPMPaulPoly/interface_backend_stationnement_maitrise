import {AnalysePAVQuartierProps} from '../types/InterfaceTypes'
import React,{useState,useEffect} from 'react';
import {Bar} from 'react-chartjs-2'
import { PAVQuartier, quartiers_analyse,entreePAV } from '../types/DataTypes';
import { serviceQuartiersAnalyse,servicePAV } from '../services';

const AnalyseProfilAccumulationVehiculeQuartiers:React.FC<AnalysePAVQuartierProps>=(props:AnalysePAVQuartierProps)=>{
    const [quartierSelect,defQuartierSelect] = useState<number>(-1);
    const [quartierOptions,defQuartierOptions] = useState<quartiers_analyse[]>([]);
    const [PAVvalide,defPAVvalide] = useState<boolean>(false);
    const [PAVQuartier,defPAVQuartier] = useState<PAVQuartier>({id_quartier:-1,capacite_stat_quartier:0,PAV:[],nom_quartier:''});
    const [PAVNouveau,defPAVNouveau] = useState<entreePAV[]>([]);

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
    }
    const gestCalculPAV=async()=>{
        const resultat = await Promise.all([servicePAV.obtientPAVQuartier(props.prioriteInventairePossibles.find((ordre)=> ordre.idPriorite=== props.prioriteInventaire)?.listeMethodesOrdonnees??[1,3,2],quartierSelect),servicePAV.recalculePAVQuartier(quartierSelect)])
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
        </div>
        <div className={"PAV"}>
            {PAVvalide?<Bar
            data={{
                // Name of the variables on x-axies for each bar
                labels: PAVQuartier.PAV.map((item)=>item.heure),
                datasets: [
                    {
                        // Label for bars
                        label: "nombre vehicules",
                        // Data or value of your each variable
                        data: PAVQuartier.PAV.map((item)=>item.voitures),
                        borderWidth: 0.5,
                        backgroundColor:'cyan'
                    },
                ],
            }}
            options={{ responsive: true, maintainAspectRatio: false }}
        />:<></>}
        
        </div>
    </div>
    )
}

export default AnalyseProfilAccumulationVehiculeQuartiers;