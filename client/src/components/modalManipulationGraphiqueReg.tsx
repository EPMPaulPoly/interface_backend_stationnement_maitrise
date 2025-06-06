import { FC, useState,useEffect } from 'react';
import  { PropsModalManipGraphiqueReg } from '../types/InterfaceTypes';
import { informations_pour_graph_unite_er_reg, utilisation_sol } from '../types/DataTypes';
import {
    Modal,
    Box,
    Button,
    Autocomplete,
    TextField,
    Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import serviceUtilisationDuSol from '../services/serviceUtilisationDuSol';
import { serviceEnsemblesReglements } from '../services';
/**
 * Permet de mettre en places les options pour un graphique
 * @param props issu de  PropsModalManipGraphiqueReg qui comporte l'ouverture du modal et 
 * @returns composante fonctionnelle JSX
 */
const ModalManipulationGraphiqueReg: FC<PropsModalManipGraphiqueReg> = (props: PropsModalManipGraphiqueReg) => {
    const [tousCUBF,defTousCUBF] = useState<utilisation_sol[]>([])
    const [regDispo,defRegDispo] = useState<informations_pour_graph_unite_er_reg[]>([])
    {/* Obtention des cubf possibles pour le dropdowns */}
    useEffect(()=>{
        const fetchData = async()=>{
            const response = await serviceUtilisationDuSol.obtientUtilisationDuSol(-1)
            defTousCUBF(response.data)
        }
        fetchData()
        console.log('obtention tous cubf')
    },[props.modalOuvert])
    {/* gestion de fermetude du modal */}
    /**
     * gestFermetureModal ferme le modal
     */
    const gestFermetureModal=()=>{
        props.defModalOuvert(false)
    }
    {/* Gestion de la sélection d'un CUBF pour le graphique */}
    /**
     * gestSelectionCUBF met à jour le CUBF et obtient les règlements associés et leurs unités pour pouoir les montrer dans une liste. Ultiment, j'ai besoin de pouvoir enlever les règlements qui n'ont pas tous les mêmes unités pour rendre le graphique lisible
     * @param CUBFSelect valeur unique du CUBF sélectionné
     */
    const gestSelectionCUBF = async(CUBFSelect:number|null)=>{
        if (typeof(CUBFSelect)==='number'){
            const objetCUBFSelect:utilisation_sol = tousCUBF.find((o)=>o.cubf===CUBFSelect)??{cubf:-1,description:'N/A'}
            props.defCUBFSelect(objetCUBFSelect)
            const reponse = await serviceEnsemblesReglements.obtiensReglementsUnitesParCUBF(props.ensRegAVis,CUBFSelect)
            console.log('reponse unites obtenues pour le cubf et ER selectionnes')
        }
    }
    {/*variable de style */}
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
    return (
        <>
            <Modal
                open={props.modalOuvert}
                onClose={gestFermetureModal}
            >
                <Box sx={style}>
                    <Box sx={{ overflowY: 'auto' }}>
                    <form onSubmit={(e) => e.preventDefault()}>
                        {/*CUBF À sélectionner*/}
                        <label htmlFor='selection-cubf'>CUBF à visualiser</label>
                        <select onChange={(e)=>gestSelectionCUBF(Number(e.target.value))} id='selection-cubf'>
                            {tousCUBF.map((c)=><option value={c.cubf}>{c.description}</option>)}
                        </select>
                        {/* Réglement Pertinents */}
                        {props.CUBFSelect.cubf!==-1?
                        <></>:<></>
                        }
                    </form>
                    </Box>
                </Box>
            </Modal>
        </>);
}

export default ModalManipulationGraphiqueReg;