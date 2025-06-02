import React, { useState, useRef } from 'react';
import { TableVisModEnsRegProps } from '../types/InterfaceTypes';
import AddIcon from '@mui/icons-material/AddOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import {Edit, Save } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';

const TableVisModEnsReg: React.FC<TableVisModEnsRegProps> = (props) => {
    
    const gestBoutonAjout = async()=>{

    }
    return (
        <div className="panneau-details-ens-reg">
            
            <h4>Détails Ensemble</h4>
            <table className="table-modif-ens-reg-entete">
            <thead>
                        <tr>
                            <th>ID ensemble</th>
                            <th>Description Ensemble</th>
                            <th>Année Début Reglement</th>
                            <th>Année Fin Reglement</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {<tr key={props.ensembleReglement[0].entete.id_er}>
                            <td>{props.ensembleReglement[0].entete.id_er}</td>
                            <td>{props.ensembleReglement[0].entete.description_er}</td>
                            <td>{props.ensembleReglement[0].entete.date_debut_er}</td>
                            <td>{props.ensembleReglement[0].entete.date_fin_er}</td>
                            <td><Edit/></td>
                        </tr>}
                    </tbody>
            </table>
            <div className="ajout-reglement"><AddIcon onClick={gestBoutonAjout}/> Ajouter association</div>
            <table className="table-modif-ens-reg-corps">
                <thead>
                    <tr>
                        <th>ID Assoc</th>
                        <th>CUBF</th>
                        <th>ID Règlement</th>
                        <th>Deb reg</th>
                        <th>Fin Reg</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {props.ensembleReglement[0].assoc_util_reg.map((assoc) => {
                        //console.log('Printing relevant rules',props.entetesReglements)
                        const foundRule = Array.isArray(props.entetesReglements)
                        ? props.entetesReglements.find(item => {
                            //console.log('Comparing:', item.id_reg_stat, 'with', assoc.id_reg_stat);
                            return item.id_reg_stat === assoc.id_reg_stat;
                        })
                        : null;
                        const foundLandUse= Array.isArray(props.ensembleReglement[0].table_util_sol)?
                        props.ensembleReglement[0].table_util_sol.find(item =>{
                            return Number(item.cubf) === assoc.cubf
                        })
                        :null;
                        //console.log('assoc.cubf:', assoc.cubf, 'foundItem:', foundLandUse);
                        return(
                        <tr key={assoc.id_assoc_er_reg} >
                            <td>{assoc.id_assoc_er_reg}</td>
                            <td>{assoc.cubf + ' - ' + (foundLandUse? foundLandUse?.description:'N/A')}</td>
                            <td>{assoc.id_reg_stat + ' - ' + (foundRule ? foundRule.description : 'N/A')}</td>
                            <td>{(foundRule ? foundRule.annee_debut_reg : 'N/A')}</td>
                            <td>{(foundRule ? foundRule.annee_fin_reg : 'N/A')}</td>
                            <td><Edit/></td>
                            <td><DeleteIcon/></td>
                        </tr>

                    )})}
                </tbody>
            </table>
        </div>
    );
};


export default TableVisModEnsReg;