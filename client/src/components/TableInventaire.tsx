import React, {useState,useRef,useEffect} from 'react';
import { inventaire_stationnement, quartiers_analyse } from '../types/DataTypes';
import { TableInventaireProps,selectLotProps } from '../types/InterfaceTypes';
import { serviceInventaire } from '../services/serviceInventaire';
import selectLotInventaire from '../utils/selectLotInventaire';

const TableInventaire:React.FC<TableInventaireProps>=(props:TableInventaireProps) =>{
    const panelRef = useRef<HTMLDivElement>(null);
    const rowRefs = useRef<{ [key: string]: HTMLTableRowElement | null }>({});

    const handleRowClick = (key: string) => {
        const propsLot: selectLotProps = {
              inventaireComplet:props.inventaire,
              numLot:key,
              lotAnalyse:props.lots,
              defLotAnalyse: props.defLots,
              inventaireAnalyse:props.itemSelect,
              defInventaireAnalyse:props.defItemSelect,
              roleAnalyse:props.donneesRole,
              defRoleAnalyse:props.defDonneesRole,
              reglementsAnalyse: props.reglements,
              defReglementsAnalyse:props.defReglements,
              ensemblesAnalyse:props.ensemblesReglements,
              defEnsemblesAnalyse: props.defEnsemblesReglements,
              methodeEstimeRegard:props.methodeEstimeRegard,
              defMethodeEstimeRegard:props.defMethodeEstimeRegard,
              regRegard:props.regRegard,
              defRegRegard: props.defRegRegard,
              ensRegRegard:props.ensRegRegard,
              defEnsRegRegard:props.defEnsRegRegard,
              roleRegard:props.roleRegard,
              defRoleRegard:props.defRoleRegard
            }
        selectLotInventaire(propsLot)
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

    useEffect(() => {
        if (props.lots.features.length > 0) {
            const lotKey = props.lots.features[0].properties.g_no_lot;
            const row = rowRefs.current[lotKey];
            if (row) {
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [props.lots]);


    return(
        <>
            
            <div className="panneau-bas-inventaire" ref={panelRef}>
                <div className="resize-handle" onMouseDown={handleMouseDown}></div>
                
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
                                <tr 
                                    key={item_inventaire.properties.g_no_lot}
                                    data-key={item_inventaire.properties.g_no_lot}
                                    ref={el => { rowRefs.current[item_inventaire.properties.g_no_lot] = el; }}
                                    onClick={(e: React.MouseEvent) => handleRowClick(item_inventaire.properties.g_no_lot)}
                                    className={props.lots.features[0]?.properties.g_no_lot === item_inventaire.properties.g_no_lot ? 'selected-row' : ''}
                                    
                                >
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