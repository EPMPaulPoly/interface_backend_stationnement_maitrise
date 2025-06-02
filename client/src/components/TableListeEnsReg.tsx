import React, { useState, useRef, useEffect } from 'react';
import { entete_reglement_stationnement } from '../types/DataTypes';
import { TableEnteteEnsembleProps } from '../types/InterfaceTypes';
import { serviceEnsemblesReglements } from "../services";
import AddIcon from '@mui/icons-material/AddOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
const TableListeEnsReg: React.FC<TableEnteteEnsembleProps> = (props) => {

    useEffect(() => { 
        const fetchData = async () => {
            try {
                const res = await serviceEnsemblesReglements.chercheTousEntetesEnsemblesReglements();
                console.log('Recu les périodes', res);
                props.defEntetesEnsembles(res.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                console.log('Failed retrieval')
            }
        };

        fetchData();
    }, []); // Empty dependency array means this runs once when the component mounts

    const onLineSelect = async (id_reg: number) => {
        const reglementAObtenir = await serviceEnsemblesReglements.chercheEnsembleReglementParId(id_reg)
        props.defEnsembleReglement(reglementAObtenir.data)
        const entetesReglementsPertinents = await serviceEnsemblesReglements.chercheReglementsPourEnsReg(id_reg)
        props.defEntetesReglements(entetesReglementsPertinents.data)
    }

    const gestBoutonAjout = async() =>{

    }

    const gestSuppressionEnsReg = async(idEnsReg:number) =>{

    }

    const panelRef = useRef<HTMLDivElement>(null);
    const handleMouseDown = (e: React.MouseEvent) => {
        const startX = e.clientX;
        const startWidth = panelRef.current ? panelRef.current.offsetWidth : 0;

        const handleMouseMove = (e: MouseEvent) => {
            const newWidth = startWidth - (startX - e.clientX);
            if (panelRef.current) {
                panelRef.current.style.width = `${newWidth}px`;
            }
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div className="panneau-entete-ens-reg" ref={panelRef}>
            <div className="resize-handle-left-panel" onMouseDown={handleMouseDown}></div>
            <h4>Entete Ensembles</h4>
            <div className="ajout-reglement"><AddIcon onClick={gestBoutonAjout}/></div>
            <div className="panneau-scroll-entete-ens-reg">
                <table className="table-entete-ens-reg">
                    <thead>
                        <tr>
                            <th>Description Ensemble</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.entetesEnsembles.map((entete) => (
                            <tr key={entete.id_er} onClick={() => onLineSelect(entete.id_er)}>
                                <td>{entete.description_er}</td>
                                <td><td onClick={()=> gestSuppressionEnsReg(entete.id_er)}><DeleteIcon /></td></td>
                            </tr>

                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


export default TableListeEnsReg;