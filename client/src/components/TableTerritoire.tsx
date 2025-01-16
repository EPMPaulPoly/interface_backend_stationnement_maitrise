import React,{useState} from 'react';
import { territoire } from '../types/DataTypes';

const TableTerritoire:React.FC<{}> =() => {
    const[etatTerritoire,defTerritoire] = useState<territoire[]>([]);

    return (
        <div>
            <h4>Table Territoire</h4>
            <table>
                <thead>
                    <tr>
                        <th>ID période</th>
                        <th>Ville</th>
                        <th>Secteur</th>
                    </tr>
                </thead>
                <tbody>
                    {etatTerritoire.map((territoire) => (
                        <tr key={territoire.id}>
                            <td>{territoire.id_periode}</td>
                            <td>{territoire.ville}</td>
                            <td>{territoire.secteur}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


export default TableTerritoire;