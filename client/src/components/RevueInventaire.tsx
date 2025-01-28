import React, { useState, useEffect,useRef } from 'react';
import { TableRevueProps } from '../types/InterfaceTypes';

const TableRevueInventaire: React.FC<TableRevueProps> =(props:TableRevueProps) =>{
    const panelRef = useRef<HTMLDivElement>(null);
    const [visibleTable, setTableVisible] = useState<number|null>(null);
    const handleMouseDown = (e: React.MouseEvent) => {
        const startX = e.clientX;
        const startWidth = panelRef.current ? panelRef.current.offsetHeight : 0;

        const handleMouseMove = (e: MouseEvent) => {
            const newWidth = startWidth + (startX - e.clientX);
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

    const clickTableCollapse = (tableNumber:number)=>{
        setTableVisible(tableNumber)
    }

    return(
        <div className="panneau-detail-inventaire-lot" ref={panelRef}>
            <div className="resize-handle-right-panel" onMouseDown={handleMouseDown}></div>
            <h4 onClick={()=>clickTableCollapse(1)}className="table-lot-title">Cadastre</h4>
            { visibleTable===1 && (<div className="lot-data-table" >
                   
                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Valeur</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Id Lot</td>
                                <td>{props.lots.features.map(item => 
                                    item.properties.g_no_lot
                                )}</td>
                            </tr>
                            <tr>
                                <td>Superficie</td>
                                <td>{props.lots.features.map(item => 
                                    item.properties.g_va_superf
                                )}</td>
                            </tr>
                            <tr>
                                <td>Latitude</td>
                                <td>{props.lots.features.map(item => 
                                    item.properties.g_nb_coo_1
                                )}</td>
                            </tr>
                            <tr>
                                <td>Longitude</td>
                                <td>{props.lots.features.map(item => 
                                    item.properties.g_nb_coord
                                )}</td>
                            </tr>
                        </tbody>
                    </table>
                    </div>)
            }
            <h4 onClick={()=>clickTableCollapse(2)}className="table-lot-title">Role</h4>
            <h4 onClick={()=>clickTableCollapse(3)}className="table-lot-title">Inventaire</h4>
            <h4 onClick={()=>clickTableCollapse(4)}className="table-lot-title">Reglements</h4>
            <h4 onClick={()=>clickTableCollapse(5)}className="table-lot-title">Ensembles Reglements</h4>
        </div>
    )
}

export default TableRevueInventaire;