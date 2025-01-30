import React, { useState, useEffect,useRef } from 'react';
import { TableRevueProps } from '../types/InterfaceTypes';

const TableRevueInventaire: React.FC<TableRevueProps> =(props:TableRevueProps) =>{
    const panelRef = useRef<HTMLDivElement>(null);
    const [visibleTable, setTableVisible] = useState<number|null>(null);
    const [roleARegarder,defRoleARegarder] = useState<string>('');
    const [regARegarder,defRegARegarder] = useState<number>(-1);
    const [ensRegARegarder,defEnsRegARegarder] = useState<number>(-1);
    const [methodeEstimeARegarder,defMethodeEstimeARegarder] = useState<number>(-1);
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

    const gestSelectRole =(e: string) =>{
        defRoleARegarder(e)
    }

    const gestSelectInventaire = (e:number)=>{
        defMethodeEstimeARegarder(e)
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
            { visibleTable===2 && (<div className="lot-data-table" >
                <div className="table-inventaire-control">
                    <label htmlFor="select-role-inventaire">Sélection Role</label>
                    <select id="select-quartier" name="select-quartier" onChange={e => gestSelectRole(e.target.value)}>
                        <option value="">Selection Role</option>
                        {props.donneesRole.features.map(role=>(
                            <option key={role.properties.id_provinc} value={role.properties.id_provinc} >
                                {role.properties?.id_provinc}
                            </option>
                        ))}
                    </select>
                </div>
                   <table>
                       <thead>
                           <tr>
                               <th>Description</th>
                               <th>Valeur</th>
                           </tr>
                       </thead>
                       <tbody>
                           <tr>
                               <td>Id Provinc</td>
                               <td>{props.donneesRole.features.find(item => 
                                   item.properties.id_provinc===roleARegarder
                               )?.properties?.id_provinc}</td>
                           </tr>
                           <tr>
                               <td>Util Pred</td>
                               <td>{props.donneesRole.features.find(item => 
                                   item.properties.id_provinc===roleARegarder
                               )?.properties?.rl0105a}</td>
                           </tr>
                           <tr>
                               <td>Nb Étages</td>
                               <td>{props.donneesRole.features.find(item => 
                                   item.properties.id_provinc===roleARegarder
                               )?.properties?.rl0306a}</td>
                           </tr>
                           <tr>
                               <td>Année Construction</td>
                               <td>{props.donneesRole.features.find(item => 
                                   item.properties.id_provinc===roleARegarder
                               )?.properties?.rl0307a}</td>
                           </tr>
                           <tr>
                               <td>Metres Carres</td>
                               <td>{props.donneesRole.features.find(item => 
                                   item.properties.id_provinc===roleARegarder
                               )?.properties?.rl0308a}</td>
                           </tr>
                           <tr>
                               <td>Nb logements</td>
                               <td>{props.donneesRole.features.find(item => 
                                   item.properties.id_provinc===roleARegarder
                               )?.properties.rl0311a}</td>
                           </tr>
                           <tr>
                               <td>Nb chambres</td>
                               <td>{props.donneesRole.features.find(item => 
                                   item.properties.id_provinc===roleARegarder
                               )?.properties?.rl0312a}</td>
                           </tr>
                       </tbody>
                   </table>
                   </div>)
           }
            <h4 onClick={()=>clickTableCollapse(3)}className="table-lot-title">Inventaire</h4>
            { visibleTable===3 && (<div className="lot-data-table" >
                <div className="table-inventaire-control">
                    <label htmlFor="select-role-inventaire">Sélection inventaire</label>
                    <select id="select-quartier" name="select-quartier" onChange={e => gestSelectInventaire(Number(e.target.value))}>
                        <option value="">Selection inventaire</option>
                        {props.inventaire.features.map(inventaire=>(
                            <option key={inventaire.properties.methode_estime} value={inventaire.properties.methode_estime} >
                                {inventaire.properties.methode_estime}
                            </option>
                        ))
                        }
                    </select>
                </div>
                   <table>
                       <thead>
                           <tr>
                               <th>Description</th>
                               <th>Valeur</th>
                           </tr>
                       </thead>
                       <tbody>
                           <tr>
                               <td>No Lot</td>
                               <td>{props.inventaire.features[0]?.properties?.g_no_lot}</td>
                           </tr>
                           <tr>
                               <td>N place min</td>
                               <td>{props.inventaire.features[0]?.properties?.n_places_min}</td>
                           </tr>
                           <tr>
                               <td>N place max</td>
                               <td>{props.inventaire.features[0]?.properties?.n_places_max}</td>
                           </tr>
                           <tr>
                               <td>N place comptees</td>
                               <td>{props.inventaire.features[0]?.properties?.n_places_mesure}</td>
                           </tr>
                           <tr>
                               <td>N place estimee</td>
                               <td>{props.inventaire.features[0]?.properties?.n_places_estime}</td>
                           </tr>
                           <tr>
                               <td>Commentaire</td>
                               <td>{props.inventaire.features[0]?.properties?.n_places_mesure}</td>
                           </tr>
                       </tbody>
                   </table>
                   </div>)}
            <h4 onClick={()=>clickTableCollapse(4)}className="table-lot-title">Reglements</h4>
            <h4 onClick={()=>clickTableCollapse(5)}className="table-lot-title">Ensembles Reglements</h4>
        </div>
    )
}

export default TableRevueInventaire;