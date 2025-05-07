import React from 'react';
import MenuBar from '../components/MenuBar';
import MenuCompQuartiers from '../components/MenuCompQuartiers';
import { useState } from 'react';
import {  TypesVisualisationAnalyseQuartier,PrioriteEstimeInventaire, VariablesPossibles } from '../types/AnalysisTypes';
import './common.css';
import './analyseparquartiers.css'
import AnalyseCartographiqueQuartiers from '../components/AnalyseCartographiqueQuartiers';
import AnalyseProfilAccumulationVehiculeQuartiers from '../components/AnalyseProfilAccumulationVehicule';
import AnalyseHistogrammeQuartier from '../components/AnalyseHistogrammeQuartier';
import AnalyseXYQuartiers from '../components/AnalyseXYQuartiers';


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
    const variablesPossibles: VariablesPossibles[]= [
            {
                idVariable:0,
                descriptionVariable:'Stationnement Total',
                requiertOrdrePriorite:true,
                queryKey:'stat-tot'
            },
            {
                idVariable:1,
                descriptionVariable:'Densité de stationnement',
                requiertOrdrePriorite:true,
                queryKey:'stat-sup'
            },
            {
                idVariable:2,
                descriptionVariable:'Stationnement par personne',
                requiertOrdrePriorite:true,
                queryKey:'stat-popu'
            },
            {
                idVariable:3,
                descriptionVariable:'Stationnement par voiture résident',
                requiertOrdrePriorite:true,
                queryKey:'stat-voit'
            },
            {
                idVariable:4,
                descriptionVariable:'Pourcentage territoire dédié stationnement',
                requiertOrdrePriorite:true,
                queryKey:'stat-perc'
            },
            {
                idVariable:5,
                descriptionVariable:'Superficie Quartier',
                requiertOrdrePriorite:false,
                queryKey:'superf'
            },
            {
                idVariable:6,
                descriptionVariable:'Population',
                requiertOrdrePriorite:false,
                queryKey:'popu'
            },
            {
                idVariable:7,
                descriptionVariable:'Densité Population',
                requiertOrdrePriorite:false,
                queryKey:'dens-pop'
            },
            {
                idVariable:8,
                descriptionVariable:'Valeur moyenne des logements',
                requiertOrdrePriorite:false,
                queryKey:'val-log-moy'
            },
            {
                idVariable:9,
                descriptionVariable:'Superficie moyenne des logements',
                requiertOrdrePriorite:false,
                queryKey:'sup-log-moy'
            },
            {
                idVariable:10,
                descriptionVariable:'Valeur Foncière totale',
                requiertOrdrePriorite:false,
                queryKey:'val-tot-quart'
            },
            {
                idVariable:11,
                descriptionVariable:'Valeur Foncière par superficie',
                requiertOrdrePriorite:false,
                queryKey:'val-tot-sup'
            },
            {
                idVariable:12,
                descriptionVariable:'Nombre de voitures',
                requiertOrdrePriorite:false,
                queryKey:'nb-voit'
            },
            {
                idVariable:13,
                descriptionVariable:'Nombre de voitures par 1000 personnes',
                requiertOrdrePriorite:false,
                queryKey:'voit-par-pers'
            },
            {
                idVariable:14,
                descriptionVariable:'Delta Voitures Jour Nuit',
                requiertOrdrePriorite:false,
                queryKey:'nb-voit-delta'
            },
            {
                idVariable:15,
                descriptionVariable:'Nombre de voitures max',
                requiertOrdrePriorite:false,
                queryKey:'nb-voit-max'
            },
            {
                idVariable:16,
                descriptionVariable:'Nombre de voitures min',
                requiertOrdrePriorite:false,
                queryKey:'nb-voit-min'
            },
            {
                idVariable:17,
                descriptionVariable:'Stationnement par voiture max',
                requiertOrdrePriorite:true,
                queryKey:'stat-voit-max'
            },
            {
                idVariable:18,
                descriptionVariable:'Stationnement par permis',
                requiertOrdrePriorite:true,
                queryKey:'stat-perm'
            },
            {
                idVariable:19,
                descriptionVariable:'Nombre de permis',
                requiertOrdrePriorite:false,
                queryKey:'perm'
            },
            {
                idVariable:20,
                descriptionVariable:'Nombre de voitures par permis',
                requiertOrdrePriorite:false,
                queryKey:'voit-par-perm'
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
                                variablesPossibles={variablesPossibles}
                            />
                        </div>);
            case 1:
                return (<div className="conteneur-resultat-comp-quartier-histo">
                            <AnalyseHistogrammeQuartier
                                prioriteInventaire={prioriteEstimes}
                                prioriteInventairePossibles={prioritesPossibles}
                                variablesPossibles={variablesPossibles}
                            />
                        </div>);
            case 2:
                return (<div className="conteneur-resultat-comp-quartier-PAV">
                            <AnalyseProfilAccumulationVehiculeQuartiers
                                prioriteInventaire={prioriteEstimes}
                                prioriteInventairePossibles={prioritesPossibles}
                            />
                        </div>);
            case 3:
                return (<div className='conteneur-resultat-comp-quartier-XY'>
                            <AnalyseXYQuartiers
                                prioriteInventaire={prioriteEstimes}
                                prioriteInventairePossibles={prioritesPossibles}
                                variablesPossibles={variablesPossibles}
                            />
                        </div>)
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