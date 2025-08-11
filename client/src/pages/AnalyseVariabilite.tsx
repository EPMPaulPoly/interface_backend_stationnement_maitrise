import React,{useState,useEffect} from 'react';
import MenuBar from '../components/MenuBar';
import './analysevariabilite.css'
import { comptes_utilisations_sol, methodeAnalyseVariabillite } from '../types/DataTypes';
import ControlAnaVar from '../components/ControlAnaVar';
import EditionParametresAnaVarFonc from '../components/EditionParametresAnaVarFonc';
import VisualisationResAnaVarFonc from '../components/VisualisationResAnaVarFonc';
import { ClimbingBoxLoader } from 'react-spinners';


const AnalyseVariabilite:React.FC = () =>{
    const [methodeAnalyse,defMethodeAnalyse] = useState<methodeAnalyseVariabillite>({idMethodeAnalyse:0,
        descriptionMethodeAnalyse:'Entrées Manuelles'});
    const [ensRegAAnalyser, defEnsRegAAnalyser] = useState<number[]>([]);
    const [editionParametres,defEditionParametres] = useState<boolean>(false);
    const [ensRegReference,defEnsRegReference] = useState<number>(-1);
    const [niveauCUBF,defNiveauCUBF] = useState<comptes_utilisations_sol>({niveau:-1,description:'invalide',n_entrees:0})
    const [calculsEnCours,defCalculsEnCours] = useState<boolean>(false);
    const colorPalette = [
    '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe'
    ];
    const methodesAnalysesPossibles:methodeAnalyseVariabillite[] =[{
        idMethodeAnalyse:0,
        descriptionMethodeAnalyse:'Entrées Manuelles'
    },
    {
        idMethodeAnalyse:1,
        descriptionMethodeAnalyse:'Données Foncières'
    }] 


    return(
        <div className="page-ana-var">
            {!calculsEnCours?
            <>
                <MenuBar/>
                <ControlAnaVar
                    methodeAnalyse={methodeAnalyse}
                    defMethodeAnalyse={defMethodeAnalyse}
                    methodessAnalysesPossibles={methodesAnalysesPossibles}
                    ensRegAAnalyser = {ensRegAAnalyser}
                    defEnsRegAAnalyser={defEnsRegAAnalyser}
                    colorPalette={colorPalette}
                    defCalculsEnCours = {defCalculsEnCours}
                />
                {methodeAnalyse.idMethodeAnalyse===1?
                    <>
                        {editionParametres?
                        <EditionParametresAnaVarFonc
                            editionParams={editionParametres}
                            defEditionParams={defEditionParametres}
                            ensRegAAnalyser={ensRegAAnalyser}
                            ensRegReference={ensRegReference}
                            defEnsRegReference={defEnsRegReference}
                            niveauCUBF={niveauCUBF}
                            defNiveauCUBF={defNiveauCUBF}
                        />
                        :
                        <VisualisationResAnaVarFonc
                            editionParams={editionParametres}
                            defEditionParams={defEditionParametres}
                            ensRegAAnalyser={ensRegAAnalyser}
                        />
                        }
                    </>:
                    <>
                    </>}</>
            :<div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh'
            }}>
                <ClimbingBoxLoader
                    loading={calculsEnCours}
                    size={50}
                    color="#fff"
                    aria-label="Calculs en Cours - Prends ton mal en patience"
                    data-testid="loader"
                />
            </div>}
            
        </div>
    )
}
export default AnalyseVariabilite;