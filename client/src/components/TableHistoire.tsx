import React, { useState, useEffect,useRef } from 'react';
import { periode } from '../types/DataTypes';
import { serviceHistorique } from '../services';
import { TableHistoireProps } from '../types/InterfaceTypes';




const TableHistoire: React.FC<TableHistoireProps> = (props:TableHistoireProps) => {
    const [etat_periodes, defPeriodes] = useState<periode[]>([]);
    const [charge, defCharg] = useState<boolean>(true);
    const [edit, defEdit] = useState<boolean>(false);
    const [etat_anciennes_periodes, defAnciennesPeriodes] = useState<periode[]>([]);
    const panelRefGauche = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const ResPeriodes = await serviceHistorique.obtientTous();
                console.log('Recu les périodes', ResPeriodes);
                defPeriodes(ResPeriodes.data);
                defAnciennesPeriodes([])
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                defCharg(false);
            }
        };

        fetchData();
    }, []); // Empty dependency array means this runs once when the component mounts

    if (charge) {
        return <div>Chargement...</div>; // You can show a loading state while waiting for the data
    }    

    const gestChangement = (id_periode: number, column:string, value: string) => {
        const newPeriodes = etat_periodes.map((periode) => {
            if (periode.id_periode === id_periode) {
                return {...periode, [column]: value};
            }
            return periode;
        });
        defPeriodes(newPeriodes);
    }

    const gestBoutonEdit = () => {
        if (props.periodeSelect !== -1) {
            defEdit(true);
            defAnciennesPeriodes(etat_periodes);
        }
    }

    const gestBoutonAnnul = () => { 
        defPeriodes(etat_anciennes_periodes)
        defEdit(false)
        defAnciennesPeriodes([])
        props.defPeriodeSelect(-1)
    }

    const gestBoutonAjout = () => {
        const newPeriode = {
            id_periode: Math.max(...etat_periodes.map((periode) => periode.id_periode)) + 1,
            nom_periode: '',
            date_debut_periode: 0,
            date_fin_periode: 0        
        }
        defPeriodes([...etat_periodes, newPeriode])
        defEdit(true)
        props.defPeriodeSelect(newPeriode.id_periode)
        defAnciennesPeriodes(etat_periodes)
    }

    const gestSelectRadio = (id_periode: number) => {

        console.log('not implemented')
    }    

    const gestBoutonSauv = () => {
        if (props.periodeSelect != -1) {
            const entry_to_add = etat_periodes.find(o => o.id_periode === props.periodeSelect);

            if (entry_to_add) {
                defPeriodes(prev => {
                    const index = prev.findIndex(o => o.id_periode === props.periodeSelect);

                    if (index !== -1) {
                        // Update existing entry
                        const updatedPeriods = [...prev];
                        updatedPeriods[index] = entry_to_add; // Replace the existing entry
                        return updatedPeriods;
                    } else {
                        // Add new entry
                        return [...prev, entry_to_add];
                    }
                });

                defAnciennesPeriodes([]); // Clear previous periods
                defEdit(false); // Disable edit mode
            } else {
                console.warn('Entry not found for the selected period.');
            }
        } else {
            console.warn('Invalid PeriodesSelect: must be a number.');
        }
    };

    const gestBoutonSuppr = () =>{
        console.log
    };

    

    const renduBoutonsTableHistoire=() =>{
        if ((edit) && (props.periodeSelect!=-1)){
            return(<div className="bouton-modif-historique">
                <button
                    onClick={gestBoutonSauv}>Save</button>
                <button
                    onClick={gestBoutonAnnul}
                >Cancel</button>
            </div>)
        }else if(!edit && props.periodeSelect!=-1){
            return (<div className="bouton-modif-historique">
                <button
                    onClick={gestBoutonAjout}>
                        Ajouter
                </button>
                <button
                    onClick={gestBoutonEdit}
                    >Éditer</button>
                </div>)
        }else{
            return (<div className="bouton-modif-historique">
                <button
                    onClick={gestBoutonAjout}>
                        Ajouter
                </button>
                <button
                    onClick={gestBoutonEdit}
                    >Éditer</button>
                <button
                    onClick={gestBoutonSuppr}>
                    Supprimer
                </button>
                </div>)
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
            const startX = e.clientX;
            const startWidth = panelRefGauche.current ? panelRefGauche.current.offsetWidth : 0;
    
            const handleMouseMove = (e: MouseEvent) => {
                const newWidth = startWidth - (startX - e.clientX);
                if (panelRefGauche.current) {
                    panelRefGauche.current.style.width = `${newWidth}px`;
                }
            };
    
            const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
    
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        };

    return (
        <div className="panneau-histoire-modifiable" ref={panelRefGauche}>
            <div className="resize-handle-left-panel" onMouseDown={handleMouseDown}></div>
            <h4>Table Histoire</h4>
            {renduBoutonsTableHistoire()}
            <table className="table-histoire">
                <thead>
                    <tr>
                        <th>Édit.</th>
                        <th>Nom</th>
                        <th>Annee Debut</th>
                        <th>Annee Fin</th>
                    </tr>
                </thead>
                <tbody>
                    {etat_periodes.map((periode) => (
                        <tr key={periode.id_periode}>
                            <td><input
                                    type="radio"
                                    name="periode_a_editer"
                                    value={periode.id_periode}
                                    onClick={() => props.defPeriodeSelect(periode.id_periode)}
                                    disabled = {edit}
                                    checked = {props.periodeSelect === periode.id_periode}
                                />    
                            </td>
                            <td>{(props.periodeSelect === periode.id_periode) && (edit) ? (<input
                                type={'string'}
                                value={periode.nom_periode !== null ? periode.nom_periode : ''}
                                onChange={(e) => gestChangement(periode.id_periode, 'nom_periode', e.target.value)}
                            />):(periode.nom_periode)}</td>
                            <td>{(props.periodeSelect === periode.id_periode) && (edit) ? (<input
                                type={'number'}
                                value={periode.date_debut_periode !== null ? periode.date_debut_periode : 0}
                                onChange={(e) => gestChangement(periode.id_periode, 'date_debut_periode', e.target.value)}
                            />):(periode.date_debut_periode)}</td>
                            <td>{(props.periodeSelect === periode.id_periode) && (edit) ? (<input
                                type={'number'}
                                value={periode.date_fin_periode !== null ? periode.date_fin_periode : 0}
                                onChange={(e) => gestChangement(periode.id_periode, 'date_fin_periode', e.target.value)}
                            />):(periode.date_fin_periode)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TableHistoire;