import React, { useState, useRef } from 'react';
import { TableVisModEnsRegProps } from '../types/InterfaceTypes';

const TableVisModEnsReg: React.FC<TableVisModEnsRegProps> = (props) => {
    


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
                        </tr>
                    </thead>
                    <tbody>
                        {<tr key={props.ensembleReglement.entete.id_er}>
                            <td>{props.ensembleReglement.entete.id_er}</td>
                            <td>{props.ensembleReglement.entete.description_er}</td>
                            <td>{props.ensembleReglement.entete.date_debut_er}</td>
                            <td>{props.ensembleReglement.entete.date_fin_er}</td>
                        </tr>}
                    </tbody>
            </table>
            <table className="table-modif-ens-reg-corps">
                <thead>
                    <tr>
                        <th>ID Assoc</th>
                        <th>CUBF</th>
                        <th>ID Règlement</th>
                    </tr>
                </thead>
                <tbody>
                    {props.ensembleReglement.assoc_util_reg.map((assoc) => {
                        //console.log('Printing relevant rules',props.entetesReglements)
                        const foundRule = Array.isArray(props.entetesReglements)
                        ? props.entetesReglements.find(item => {
                            //console.log('Comparing:', item.id_reg_stat, 'with', assoc.id_reg_stat);
                            return item.id_reg_stat === assoc.id_reg_stat;
                        })
                        : null;
                        const foundLandUse= Array.isArray(props.ensembleReglement.table_util_sol)?
                        props.ensembleReglement.table_util_sol.find(item =>{
                            return Number(item.cubf) === assoc.cubf
                        })
                        :null;
                        //console.log('assoc.cubf:', assoc.cubf, 'foundItem:', foundLandUse);
                        return(
                        <tr key={assoc.id_assoc_er_reg} >
                            <td>{assoc.id_assoc_er_reg}</td>
                            <td>{assoc.cubf + ' - ' + (foundLandUse? foundLandUse?.description:'N/A')}</td>
                            <td>{assoc.id_reg_stat + ' - ' + (foundRule ? foundRule.description : 'N/A')}</td>
                        </tr>

                    )})}
                </tbody>
            </table>
        </div>
    );
};


export default TableVisModEnsReg;