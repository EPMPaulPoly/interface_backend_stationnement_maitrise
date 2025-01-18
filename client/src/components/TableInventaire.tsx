import React, {useState,useRef} from 'react';
import { inventaire_stationnement, quartiers_analyse } from '../types/DataTypes';
import { TableInventaireProps } from '../types/InterfaceTypes';
import { serviceInventaire } from '../services/serviceInventaire';

const TableInventaire:React.FC<TableInventaireProps>=({
    quartier,
    defQuartier,
    optionsQuartiers,
    defOptionsQuartiers,
    inventaire,
    defInventaire
}) =>{
    const panelRef = useRef<HTMLDivElement>(null);
    const gestSelectQuartier = async (quartier_selectionne:number) =>{
        defQuartier(quartier_selectionne)
        const inventaire = await serviceInventaire.obtientInventaireParQuartier(quartier_selectionne)
        if (inventaire.success){
            defInventaire(inventaire.data)
        }
    }

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


    return(
        <>
            
            <div className="panneau-bas-inventaire" ref={panelRef}>
                <div className="resize-handle" onMouseDown={handleMouseDown}></div>
                <div className="table-inventaire-control">
                    <label htmlFor="select-quartier">Sélection Quartier</label>
                    <select id="select-quartier" name="select-quartier" onChange={e => gestSelectQuartier(Number(e.target.value))}>
                        <option value="">Selection quartier</option>
                        {optionsQuartiers.map(quartier=>(
                            <option key={quartier.id_quartier} value={quartier.id_quartier} >
                                {quartier.nom_quartier}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="table-inventaire-rendu-container">
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
                                    <td>{item_inventaire.g_no_lot}</td>
                                    <td>{typeof(item_inventaire.n_places_min) == 'number'? item_inventaire.n_places_min.toFixed(2):item_inventaire.n_places_min}</td>
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