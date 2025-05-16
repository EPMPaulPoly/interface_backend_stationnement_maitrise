import React, { useState, useRef } from 'react';
import { TableVisModRegProps } from '../types/InterfaceTypes';
import { definition_reglement_stationnement, entete_reglement_stationnement, reglement_complet } from '../types/DataTypes';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { Add, Check, Edit } from '@mui/icons-material';
import { serviceReglements } from '../services';

const TableVisModReglement: React.FC<TableVisModRegProps> = (props) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const handleMouseDown = (e: React.MouseEvent) => {
        const startY = e.clientY;
        const startHeight = panelRef.current ? panelRef.current.offsetHeight : 0;

        const handleMouseMove = (e: MouseEvent) => {
            const newHeight = startHeight + (startY - e.clientY);
            if (panelRef.current) {
                panelRef.current.style.height = `${newHeight}px`;
            }
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };
    const gestChangementEntete=(idReg:number,champs:string,valeur:string|null)=>{
        const newEntete = ((champs === 'annee_debut_reg' || champs === 'annee_fin_reg') && valeur !== null)
            ? { ...props.regSelect.entete, [champs]: Number(valeur) }
            : { ...props.regSelect.entete, [champs]: valeur };
        const oldStack = props.regSelect.definition;
        const newRegSelect: reglement_complet = { entete: newEntete, definition: oldStack };
        props.defRegSelect(newRegSelect);
    }
    const gestSauvegardeEntete=async()=>{
        const enteteASauver:Omit<entete_reglement_stationnement,'id_reg_stat'>={
            description:props.regSelect.entete.description,
            annee_debut_reg:props.regSelect.entete.annee_debut_reg,
            annee_fin_reg:props.regSelect.entete.annee_fin_reg,
            texte_loi:props.regSelect.entete.texte_loi,
            article_loi:props.regSelect.entete.article_loi,
            paragraphe_loi:props.regSelect.entete.paragraphe_loi,
            ville:props.regSelect.entete.ville
        }
        let result;
        if (props.creationEnCours){
            result = await serviceReglements.nouvelEnteteReglement(enteteASauver);
        } else{
            result = await serviceReglements.modifieEnteteReglement(props.regSelect.entete.id_reg_stat,enteteASauver)
        }
        const newEntete:entete_reglement_stationnement = result.data[0]
        const newDef:definition_reglement_stationnement[] = props.regSelect.definition.map((entree)=>({
            id_reg_stat:newEntete.id_reg_stat,
            id_reg_stat_emp:entree.id_reg_stat_emp,
            ss_ensemble:entree.ss_ensemble,
            oper:entree.oper,
            seuil:entree.seuil,
            cases_fix_max:entree.cases_fix_max,
            cases_fix_min:entree.cases_fix_min,
            pente_max:entree.pente_max,
            pente_min:entree.pente_min,
            unite:entree.unite
        }))
        const newRegSelect: reglement_complet = {entete:newEntete,definition:newDef}
        
        props.defRegSelect(newRegSelect)
        props.defEditionEnteteEnCours(false)
        props.defEditionCorpsEnCours(true)
    }
    return (
        <div className="panneau-details-reglements" ref={panelRef}>
            <div className="resize-handle" onMouseDown={handleMouseDown}></div>
            <h4>Détails Règlements</h4>
            <table className="table-modif-reglements-entete">
                <thead>
                    <tr>
                        <th>ID reglement</th>
                        <th>Description</th>
                        <th>Année Début</th>
                        <th>Année Fin</th>
                        {props.editionEnteteEnCours?<th>En vigueur</th>:<></>}
                        <th>Texte Loi</th>
                        <th>Article Loi</th>
                        <th>Paragraphe Loi</th>
                        <th>Ville</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {<tr key={props.regSelect.entete.id_reg_stat}>
                        <td>{props.regSelect.entete.id_reg_stat}</td>
                        <td>{props.editionEnteteEnCours?
                            (
                                <input 
                                    type={'string'}
                                    value={props.regSelect.entete.description !== null ? props.regSelect.entete.description : ''}
                                    onChange={(e) => gestChangementEntete(props.regSelect.entete.id_reg_stat,'description', e.target.value)}/>
                            ):(
                                props.regSelect.entete.description
                            )}</td>
                        <td>{props.editionEnteteEnCours?
                                (
                                    <input 
                                    type={'number'}
                                    value={props.regSelect.entete.annee_debut_reg !== null ? props.regSelect.entete.annee_debut_reg : ''}
                                    onChange={(e) => gestChangementEntete(props.regSelect.entete.id_reg_stat,'annee_debut_reg', e.target.value)}
                                    size={6}
                                    min="0"
                                    max="9999"/>
                                ):(
                                    props.regSelect.entete.annee_debut_reg
                                )}
                        </td>
                        <td>{props.editionEnteteEnCours && props.regSelect.entete.annee_fin_reg!==null?
                                (
                                    <input 
                                    type={'number'}
                                    value={props.regSelect.entete.annee_fin_reg !== null ? props.regSelect.entete.annee_fin_reg : ''}
                                    onChange={(e) => gestChangementEntete(props.regSelect.entete.id_reg_stat,'annee_fin_reg', e.target.value)}
                                    size={6}
                                    min="0"
                                    max="9999"/>
                                ):(
                                    props.regSelect.entete.annee_fin_reg
                                )}</td>
                        {props.editionEnteteEnCours?
                            (<td><input 
                            type={'checkbox'}
                            checked={props.regSelect.entete.annee_fin_reg===null}
                            onClick={() => props.regSelect.entete.annee_fin_reg===null?gestChangementEntete(props.regSelect.entete.id_reg_stat, 'annee_fin_reg', '2025'):gestChangementEntete(props.regSelect.entete.id_reg_stat,'annee_fin_reg',null)}
                            /></td>):(<></>)}        
                        <td>{props.editionEnteteEnCours?
                                (
                                    <input 
                                    type={'string'}
                                    value={props.regSelect.entete.texte_loi !== null ? props.regSelect.entete.texte_loi : ''}
                                    onChange={(e) => gestChangementEntete(props.regSelect.entete.id_reg_stat,'texte_loi', e.target.value)}
                                    size={10}/>
                                ):(
                                    props.regSelect.entete.texte_loi
                                )
                            }
                        </td>
                        <td>{props.editionEnteteEnCours?
                                (
                                    <input 
                                    type={'string'}
                                    value={props.regSelect.entete.article_loi !== null ? props.regSelect.entete.article_loi : ''}
                                    onChange={(e) => gestChangementEntete(props.regSelect.entete.id_reg_stat,'article_loi', e.target.value)}
                                    size={10}/>
                                ):(
                                    props.regSelect.entete.article_loi
                                )
                            }</td>
                        <td>{props.editionEnteteEnCours?(
                                <input 
                                    type={'string'}
                                    value={props.regSelect.entete.paragraphe_loi !== null ? props.regSelect.entete.paragraphe_loi : ''}
                                    onChange={(e) => gestChangementEntete(props.regSelect.entete.id_reg_stat,'paragraphe_loi', e.target.value)}
                                    size={10}/>
                            ):(
                                props.regSelect.entete.paragraphe_loi
                            )
                        }
                        </td>
                        <td>{props.editionEnteteEnCours?(
                                <input 
                                    type={'string'}
                                    value={props.regSelect.entete.ville !== null ? props.regSelect.entete.ville : ''}
                                    onChange={(e) => gestChangementEntete(props.regSelect.entete.id_reg_stat,'ville', e.target.value)}
                                    size={10}/>
                            ):(props.regSelect.entete.ville)}</td>
                        <td>{props.creationEnCours?(<><SaveIcon onClick={gestSauvegardeEntete}/></>):(<><Edit /></>)}</td>
                        <td>{props.creationEnCours?(<><CancelIcon/></>):(<><DeleteIcon /></>)}</td>
                    </tr>
                    }
                </tbody>
            </table>
            <table className="table-modif-reglements-corps">
                <thead>
                    <tr>
                        <th>Sous-Ensemble</th>
                        <th>Seuil</th>
                        <th>Opération</th>
                        <th>Abscisse Min.</th>
                        <th>Abscisse Max.</th>
                        <th>Pente Minimum</th>
                        <th>Pente Maximum</th>
                        <th>Unite</th>
                    </tr>
                </thead>
                <tbody>
                    {props.regSelect.definition.map((ligneDef) => (
                        <tr key={ligneDef.id_reg_stat_emp} >
                            <td>{ligneDef.ss_ensemble}</td>
                            <td>{ligneDef.seuil}</td>
                            <td>{ligneDef.oper}</td>
                            <td>{ligneDef.cases_fix_min}</td>
                            <td>{ligneDef.cases_fix_max}</td>
                            <td>{ligneDef.pente_min}</td>
                            <td>{ligneDef.pente_max}</td>
                            <td>{ligneDef.unite}</td>
                        </tr>

                    ))}
                </tbody>
            </table>
        </div>
    );
};


export default TableVisModReglement;