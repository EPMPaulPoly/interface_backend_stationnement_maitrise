import React, {useState,} from 'react';
import { inventaire_stationnement } from '../types/DataTypes';
import { TableInventaireProps } from '../types/InterfaceTypes';

const TableInventaire:React.FC<TableInventaireProps>=({
    quartier,
    defQuartier,
    optionsQuartiers,
    defOptionsQuartiers,
    inventaire,
    defInventaire
}) =>{
    
    return(
        <>
            <div className="panneau-bas-inventaire">
                <div className="table-inventaire-control">
                    <label htmlFor="select-quartier">Sélection Quartier</label>
                    <select id="select-quartier" name="select-quartier">
                        <option value="">Selection quartier</option>
                        {/* Add options here */}
                    </select>
                </div>
                <div>
                    <table className="table-inventaire-rendu">
                        <thead>
                            <tr>
                                <th>ID Lot</th>
                                <th>Places Min</th>
                                <th>Places Max</th>
                                <th>Places Mes.</th>
                                <th>Places Est.</th>
                                <th>Methode Est</th>
                                <th>ID Ens. Reg</th>
                                <th>ID Reg. </th>
                                <th>CUBF</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventaire.map((item_inventaire) => (
                                <tr key={item_inventaire.g_no_lot}>
                                    <td>{item_inventaire.n_places_min}</td>
                                    <td>{item_inventaire.n_places_max}</td>
                                    <td>{item_inventaire.n_places_mesure}</td>
                                    <td>{item_inventaire.n_places_estime}</td>
                                    <td>{item_inventaire.methode_estime}</td>
                                    <td>{item_inventaire.id_er}</td>
                                    <td>{item_inventaire.id_reg_stat}</td>
                                    <td>{item_inventaire.cubf}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};
export default TableInventaire;