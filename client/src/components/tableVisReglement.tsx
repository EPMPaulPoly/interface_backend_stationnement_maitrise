import React, { useState, useRef } from 'react';
import { entete_reglement_stationnement } from '../types/DataTypes';
import { TableVisModRegProps } from '../types/InterfaceTypes';

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

    return (
        <div className="panneau-details-reglements" ref={panelRef}>
            <div className="resize-handle" onMouseDown={handleMouseDown}></div>
            <h4>Détails Règlements</h4>
            <table className="table-modif-reglements-entete">
                <thead>
                    <tr>
                        <th>ID reglement</th>
                        <th>Description Reglement</th>
                        <th>Année Début Reglement</th>
                        <th>Année Fin Reglement</th>
                        <th>Texte Loi</th>
                        <th>Article Loi</th>
                        <th>Paragraphe Loi</th>
                        <th>Ville</th>
                    </tr>
                </thead>
                <tbody>
                    {<tr key={props.regSelect.entete.id_reg_stat}>
                        <td>{props.regSelect.entete.id_reg_stat}</td>
                        <td>{props.regSelect.entete.description}</td>
                        <td>{props.regSelect.entete.annee_debut_reg}</td>
                        <td>{props.regSelect.entete.annee_fin_reg}</td>
                        <td>{props.regSelect.entete.texte_loi}</td>
                        <td>{props.regSelect.entete.article_loi}</td>
                        <td>{props.regSelect.entete.paragraphe_loi}</td>
                        <td>{props.regSelect.entete.ville}</td>
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