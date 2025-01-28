import React, {useState,useRef} from 'react';
import { inventaire_stationnement, quartiers_analyse } from '../types/DataTypes';
import { TableInventaireProps } from '../types/InterfaceTypes';
import { serviceInventaire } from '../services/serviceInventaire';
import selectLotInventaire from '../utils/selectLotInventaire';

const TableInventaire:React.FC<TableInventaireProps>=(props:TableInventaireProps) =>{
    const panelRef = useRef<HTMLDivElement>(null);
    const gestSelectQuartier = async (quartier_selectionne:number) =>{
        props.defQuartier(quartier_selectionne)
        const inventaire = await serviceInventaire.obtientInventaireParQuartier(quartier_selectionne)
        if (inventaire.success){
            props.defInventaire(inventaire.data)
        }
    }

    const handleRowClick = (key: string) => {
        selectLotInventaire(props.inventaire,key)
    };

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
                        {props.optionsQuartiers.map(quartier=>(
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
                            {props.inventaire.features.map((item_inventaire,index) => (
                                item_inventaire.properties && (
                                <tr key={item_inventaire.properties.g_no_lot}
                                    data-key={item_inventaire.properties.g_no_lot}
                                    onClick={(e: React.MouseEvent) => handleRowClick(item_inventaire.properties.g_no_lot)}>
                                    <td>{item_inventaire.properties?.g_no_lot}</td>
                                    <td>{typeof(item_inventaire.properties?.n_places_min) == 'number'? item_inventaire.properties?.n_places_min.toFixed(2):item_inventaire.properties.n_places_min}</td>
                                    <td>{item_inventaire.properties?.n_places_max}</td>
                                    <td>{item_inventaire.properties?.n_places_mesure}</td>
                                    <td>{item_inventaire.properties?.n_places_estime}</td>
                                    <td>{item_inventaire.properties?.methode_estime}</td>
                                    <td>{item_inventaire.properties?.id_er}</td>
                                    <td>{item_inventaire.properties?.id_reg_stat}</td>
                                    <td>{item_inventaire.properties?.cubf}</td>
                                </tr>
                            )))}
                        </tbody>
                    </table>
                </div>
            </div>
            
        </>
        
    );
};
export default TableInventaire;