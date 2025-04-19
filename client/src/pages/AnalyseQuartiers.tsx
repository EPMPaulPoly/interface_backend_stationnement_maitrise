import React from 'react';
import MenuBar from '../components/MenuBar';
import MenuCompQuartiers from '../components/MenuCompQuartiers';
import { useState } from 'react';
import {  TypesVisualisationAnalyseQuartier,PrioriteEstimeInventaire } from '../types/AnalysisTypes';
import './common.css';
import './analyseparquartiers.css'
import AnalyseCartographiqueQuartiers from '../components/AnalyseCartographiqueQuartiers';
import AnalyseProfilAccumulationVehiculeQuartiers from '../components/AnalyseProfilAccumulationVehicule';
import AnalyseHistogrammeQuartier from '../components/AnalyseHistogrammeQuartier';


const AnalyseQuartiers:React.FC = () =>{
    const [methodeComp, defMethodeComp] = useState<number>(-1);
    const [prioriteEstimes,defPrioriteEstimes] = useState<number>(0);
    const [agregEnCours,defAgregEnCours] = useState<boolean>(false);
    const methodesAnalyse: TypesVisualisationAnalyseQuartier[] = [
        {
            idAnalyse: 0,
            descriptionAnalyse: "Cartographie",
        },
        {
            idAnalyse: 1,
            descriptionAnalyse: "Histogramme",
        },
        {
            idAnalyse:2,
            descriptionAnalyse: "Profile d'accumulation véhicule"
        },
        {
            idAnalyse:3,
            descriptionAnalyse:"Graphique XY"
        }
    ];
    const prioritesPossibles:PrioriteEstimeInventaire[]=[
        {
            idPriorite:0,
            descriptionPriorite:"Manuel -> Reg. Manuel -> Reg. Rôle",
            listeMethodesOrdonnees:[1,3,2]
        },
        {
            idPriorite:1,
            descriptionPriorite:"Manuel -> Reg. Rôle -> Reg. Manuel",
            listeMethodesOrdonnees:[1,2,3]
        },
        {
            idPriorite:2,
            descriptionPriorite:"Reg. Rôle -> Manuel -> Reg. Manuel",
            listeMethodesOrdonnees:[2,1,3]
        },
        {
            idPriorite:3,
            descriptionPriorite:"Reg. Rôle -> Reg. Manuel -> Manuel",
            listeMethodesOrdonnees:[2,3,1]
        },
        {
            idPriorite:4,
            descriptionPriorite:"Reg. Manuel -> Reg. Rôle -> Manuel",
            listeMethodesOrdonnees:[3,2,1]
        },
        {
            idPriorite:5,
            descriptionPriorite:"Reg. Manuel -> Manuel -> Reg. Rôle",
            listeMethodesOrdonnees:[3,1,2]
        },
    ];

    const renduComposanteAnalyse = () => {
        switch (methodeComp) {
            case 0:
                return (<div className="conteneur-resultat-comp-quartier">
                            <AnalyseCartographiqueQuartiers 
                                prioriteInventaire={prioriteEstimes}
                                prioriteInventairePossibles={prioritesPossibles}
                            />
                        </div>);
            case 1:
                return (<div className="conteneur-resultat-comp-quartier-histo"><AnalyseHistogrammeQuartier
                                prioriteInventaire={prioriteEstimes}
                                prioriteInventairePossibles={prioritesPossibles}
                            />
                        </div>);
            case 2:
                return (<div className="conteneur-resultat-comp-quartier-PAV">
                    <AnalyseProfilAccumulationVehiculeQuartiers
                        prioriteInventaire={prioriteEstimes}
                        prioriteInventairePossibles={prioritesPossibles}
                    />
                </div>);
            default:
                return <div>Veuillez sélectionner une méthode d'analyse</div>;
        }
    };
    const renduNormal=()=>{
        return(
            <>
            <MenuCompQuartiers
                methodeAnalyse={methodeComp}
                defMethodeAnalyse={defMethodeComp}
                methodesPossibles={methodesAnalyse}
                prioriteInventaire={prioriteEstimes}
                defPrioriteInventaire={defPrioriteEstimes}
                prioriteInventairePossibles={prioritesPossibles}
                defCalculEnCours={defAgregEnCours}
            />
            {renduComposanteAnalyse()}
            </>
        )
    };

    return(
        <div className="page-comp-quart">
            <MenuBar/>
            {agregEnCours?<p>Calcul en cours</p>:renduNormal()}
        </div>
    )
}
export default AnalyseQuartiers;