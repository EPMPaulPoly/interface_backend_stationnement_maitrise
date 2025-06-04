import React, { useEffect, useState } from 'react';
import { creationAssocCubfErRegStat } from '../types/InterfaceTypes';
import { Modal,Box } from '@mui/material';
import { association_util_reglement, ensemble_reglements_stationnement, entete_reglement_stationnement, utilisation_sol } from '../types/DataTypes';
import serviceUtilisationDuSol from '../services/serviceUtilisationDuSol';
import { serviceEnsemblesReglements, serviceReglements } from '../services';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import FiltreReglement from './filtreReglement';
import TableVisResultatsFiltreAssoc from './TableVisResultatsFiltreAssoc';
import { Save } from '@mui/icons-material';
const CreationAssociationCubfRegEnsReg: React.FC<creationAssocCubfErRegStat> = (props) => {
    const [CUBFN1,defCUBFN1] = useState<number>(-1);
    const [optionsCUBFN1,defOptionsCUBFN1] = useState<utilisation_sol[]>([]);
    const [CUBFN2,defCUBFN2] = useState<number>(-1);
    const [optionsCUBFN2,defOptionsCUBFN2] = useState<utilisation_sol[]>([]);
    const [CUBFN3,defCUBFN3] = useState<number>(-1);
    const [optionsCUBFN3,defOptionsCUBFN3] = useState<utilisation_sol[]>([]);
    const [CUBFN4,defCUBFN4] = useState<number>(-1);
    const [optionsCUBFN4,defOptionsCUBFN4] = useState<utilisation_sol[]>([]);
    const [tousCUBF,defTousCUBF] = useState<utilisation_sol[]>([]);
    const [entetesReglements,defEntetesReglements] = useState<entete_reglement_stationnement[]>([]);
    const [CUBFSelect,defCUBFSelect] = useState<utilisation_sol|null>(null)
    const [regSelect,defRegSelect] = useState<entete_reglement_stationnement|null>(null)

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minWidth: 300,
        width: 'auto',
        // This is key:
        maxHeight: '80vh', // Or any value
        overflowY: 'auto', // Enables scrolling
        bgcolor: 'black',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    const gestFermetureModal = ()=>{
        props.defModalOuvert(false)
        defCUBFN1(-1)
        defCUBFN2(-1)
        defCUBFN3(-1)
        defCUBFN4(-1)
        defOptionsCUBFN1([])
        defOptionsCUBFN2([])
        defOptionsCUBFN3([])
        defOptionsCUBFN4([])
        defTousCUBF([])
        defCUBFSelect(null)
        defRegSelect(null)
    }
    const gestChangementListesCUBF= async(niveau:number,valeur:string)=>{
        if (niveau ===1 && Number(valeur)<10){
            defCUBFN1(Number(valeur))
            const donneesNiveauDeux = await serviceUtilisationDuSol.obtientUtilisationDuSol(Number(valeur))
            defOptionsCUBFN2(donneesNiveauDeux.data)
            defCUBFN2(-1)
            defCUBFN3(-1)
            defCUBFN4(-1)
        } else if(niveau===2 && Number(valeur)>=10 && Number(valeur)<100){
            defCUBFN2(Number(valeur))
            const donneesNiveauTrois = await serviceUtilisationDuSol.obtientUtilisationDuSol(Number(valeur))
            defOptionsCUBFN3(donneesNiveauTrois.data)
            defCUBFN3(-1)
            defCUBFN4(-1)
        }else if(niveau===3 && Number(valeur)>=100 && Number(valeur)<1000){
            defCUBFN3(Number(valeur))
            const donneesNiveauQuatre = await serviceUtilisationDuSol.obtientUtilisationDuSol(Number(valeur))
            defOptionsCUBFN4(donneesNiveauQuatre.data)
            defCUBFN4(-1)
        }else if(niveau===4 && Number(valeur)>=1000 ){
            defCUBFN4(Number(valeur))
        }
    }
    const gestSelectionCUBF =(cubf:number)=>{
        const cubfAImplementer = tousCUBF.find((o)=>Number(o.cubf)===cubf)
        if (cubf!==-1 && typeof(cubfAImplementer)!=='undefined'){
            defCUBFSelect(cubfAImplementer)
        }
    }

    const gestSauvegardeAssociation = async () => {
        if (CUBFSelect === null) {
            // Optionally handle the error or return early
            return;
        }
        if (regSelect === null){
            return;
        }
        const associationASauver: Omit<association_util_reglement, 'id_assoc_er_reg'> = {
            cubf: Number(CUBFSelect.cubf),
            id_er: props.ensembleReglement.entete.id_er,
            id_reg_stat:Number(regSelect.id_reg_stat)
        };
        let response:any
        if (props.idAssociationEnEdition===-1){
            response = await serviceEnsemblesReglements.nouvelleAssoc(associationASauver)
            if (response.success){
                const entete = props.ensembleReglement.entete
                const table_util_sol = props.ensembleReglement.table_util_sol
                const table_etendue = props.ensembleReglement.table_etendue
                const nouvelleTableAssoc = [...props.ensembleReglement.assoc_util_reg,response.data]
                const nouvelEnsembleReglement:ensemble_reglements_stationnement={
                    entete:entete,
                    table_util_sol:table_util_sol,
                    table_etendue:table_etendue,
                    assoc_util_reg:nouvelleTableAssoc
                }
                props.defEnsembleReglement(nouvelEnsembleReglement)
                props.defIdAssociationEnEdition(-1)
                props.defModalOuvert(false)
            }
        } else{
            response = await serviceEnsemblesReglements.modifAssoc(props.idAssociationEnEdition,associationASauver)
            if (response.success){
                const entete = props.ensembleReglement.entete
                const table_util_sol = props.ensembleReglement.table_util_sol
                const table_etendue = props.ensembleReglement.table_etendue
                const nouvelleTableAssoc = props.ensembleReglement.assoc_util_reg.map((o)=>o.id_assoc_er_reg===props.idAssociationEnEdition?response.data:o)
                const nouvelEnsembleReglement:ensemble_reglements_stationnement={
                    entete:entete,
                    table_util_sol:table_util_sol,
                    table_etendue:table_etendue,
                    assoc_util_reg:nouvelleTableAssoc
                }
                props.defEnsembleReglement(nouvelEnsembleReglement)
                props.defIdAssociationEnEdition(-1)
                props.defModalOuvert(false)
            }
        }
        // Continue with the rest of your logic here
    }

    useEffect(() => {
        if (props.modalOuvert) {
            const fetchData = async () => {
                try {
                    if (props.idAssociationEnEdition ===-1){
                        const [reponseTous, reponseN1,reponseEntete] = await Promise.all([
                            serviceUtilisationDuSol.obtientUtilisationDuSol(),
                            serviceUtilisationDuSol.obtientUtilisationDuSol(-1),
                            serviceReglements.chercheTousEntetesReglements()
                        ]);
                        defTousCUBF(reponseTous.data);
                        defOptionsCUBFN1(reponseN1.data);
                        props.defTousReglement(reponseEntete.data)
                        defEntetesReglements(reponseEntete.data)
                    }
                } catch (error) {
                    console.error("Erreur lors du chargement des données d'utilisation du sol :", error);
                }
            };

            fetchData();
        }
    }, [props.modalOuvert]);
    return(<>
    <Modal
        open={props.modalOuvert}
        onClose={gestFermetureModal}
    >
        <Box sx={style}>
            <Box sx={{ overflowY: 'auto' }}>
            <form onSubmit={(e) => e.preventDefault()}>
                {/*identifiant*/}
                <div>
                    <h4>Association modifiee</h4>
                    <p>
                        {props.idAssociationEnEdition !== -1
                            ? <>Identifiant Association: {props.idAssociationEnEdition} <br/></>
                            : <>Nouvelle Association<br/></>}
                        {CUBFSelect!==null? CUBFSelect.description:''}
                        {CUBFSelect!==null && regSelect!==null?'>':''}
                        {regSelect!==null?regSelect.description:''}
                        <><br/></>
                        {CUBFSelect!==null && regSelect!==null?<><Save onClick={gestSauvegardeAssociation}/></>:<></>}
                    </p>
    
                </div>
                {/*Utilisation du sol*/}
                <div>
                    <h4>Utilisation du sol</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
                        <div className='form-row'>
                            <label htmlFor="cubf-n1" className='form-label'>Premier Niveau</label>
                            <select
                                id="cubf-n1"
                                onChange={e => gestChangementListesCUBF(1, e.target.value)}
                                className="select-N1 form-dropdown"
                                value={CUBFN1}
                            >
                                <option key={-1} value={-1}>Choisissez un CUBF de niveau 1</option>
                                {optionsCUBFN1.map(o => (
                                    <option key={o.cubf} value={o.cubf}>{o.description}</option>
                                ))}
                            </select>
                            <InsertLinkIcon style={{ verticalAlign: 'middle', marginLeft: 8 }} onClick={()=>{gestSelectionCUBF(CUBFN1)}}/>
                        </div >
                        <div className='form-row'>
                            <label htmlFor="cubf-n2" className='form-label'>Deuxième Niveau</label>
                            <select
                                id="cubf-n2"
                                onChange={e => gestChangementListesCUBF(2, e.target.value)}
                                className="select-N2 form-dropdown"
                                disabled={CUBFN1 === -1}
                                value={CUBFN2}
                            >
                                <option value={-1}>Choisissez un CUBF de niveau 2</option>
                                {optionsCUBFN2.map(o => (
                                    <option key={o.cubf} value={o.cubf}>{o.description}</option>
                                ))}
                            </select>
                            <InsertLinkIcon style={{ verticalAlign: 'middle', marginLeft: 8 }} onClick={()=>{gestSelectionCUBF(CUBFN2)}} />
                        </div>
                        <div className='form-row'>
                            <label htmlFor="cubf-n3" className='form-label'>Troisième Niveau</label>
                            <select
                                id="cubf-n3"
                                onChange={e => gestChangementListesCUBF(3, e.target.value)}
                                className="select-N3 form-dropdown"
                                disabled={CUBFN2 === -1}
                                value={CUBFN3}
                            >
                                <option value={-1}>Choisissez un CUBF de niveau 3</option>
                                {optionsCUBFN3.map(o => (
                                    <option key={o.cubf} value={o.cubf}>{o.description}</option>
                                ))}
                            </select>
                            <InsertLinkIcon style={{ verticalAlign: 'middle', marginLeft: 8 }} onClick={()=>{gestSelectionCUBF(CUBFN3)}}/>
                        </div>
                        <div className='form-row'>
                            <label htmlFor="cubf-n4" className='form-label'>Boss!!!!!</label>
                            <select
                                id="cubf-n4"
                                onChange={e => gestChangementListesCUBF(4, e.target.value)}
                                className="select-N4 form-dropdown"
                                disabled={CUBFN3 === -1}
                                value={CUBFN4}
                            >
                                <option value={-1}>Choisissez un CUBF de niveau 4</option>
                                {optionsCUBFN4.map(o => (
                                    <option key={o.cubf} value={o.cubf}>{o.description}</option>
                                ))}
                            </select>
                            <InsertLinkIcon style={{ verticalAlign: 'middle', marginLeft: 8 }} onClick={()=>{gestSelectionCUBF(CUBFN4)}}/>
                        </div>
                    </div>
                </div>
                {/*Recherche Reglement*/}
                <FiltreReglement
                    resultatReglements={entetesReglements}
                    defResultatReglements={defEntetesReglements}
                    tousReglements={props.tousReglements}
                    defTousReglement={props.defTousReglement}
                />
                {/* rReglements possible */}
                <TableVisResultatsFiltreAssoc
                    reglementAAssocier={regSelect}
                    defReglementAssocier={defRegSelect}
                    reglementsPossible={entetesReglements}
                    defReglementPossible={defEntetesReglements}
                />
            </form>
            </Box>
        </Box>
    </Modal>
    </>)
}

export default CreationAssociationCubfRegEnsReg;
