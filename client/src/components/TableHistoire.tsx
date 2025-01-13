import React, { useState, useEffect } from 'react';
import { periode } from '../types/DataTypes';


interface TableHistoireProps {
    periodes: periode[],
}



const TableHistoire: React.FC<TableHistoireProps> = ({periodes}) => {

    return (
        <div>
            <h2>Table Histoire</h2>
            <table>
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Annee Debut</th>
                        <th>Annee Fin</th>
                    </tr>
                </thead>
                <tbody>
                    {periodes.map((periode) => (
                        <tr key={periode.id_periode}>
                            <td>{periode.nom_periode}</td>
                            <td>{periode.date_debut_periode}</td>
                            <td>{periode.date_fin_periode}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TableHistoire;