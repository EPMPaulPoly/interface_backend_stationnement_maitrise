import React,{useState,useRef,useEffect} from 'react';
import { entete_reglement_stationnement } from '../types/DataTypes';
import { TableEnteteProps } from '../types/InterfaceTypes';
import { serviceReglements } from "../services";

const TableEnteteReglements:React.FC<TableEnteteProps> =(props) => {

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resReglements = await serviceReglements.chercheTousEntetesReglements();
                console.log('Recu les périodes', resReglements);
                props.defEntetes(resReglements.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                props.defCharge(false);
            }
        };

        fetchData();
    }, []); // Empty dependency array means this runs once when the component mounts
    
    if (props.charge) {
        return <div>Chargement...</div>; // You can show a loading state while waiting for the data
    }  
    const onLineSelect = (id_reg:number)=>{
        props.defEnteteSelect(id_reg)
    }
    
    return (
        <div className="panneau-table-entete">
            <h4>Entete reglements</h4>
            <table className="table-entete-reglements">
                <thead>
                    <tr>
                        <th>ID reglement</th>
                        <th>Description Reglement</th>
                        <th>Année Début Reglement</th>
                        <th>Année Fin Reglement</th>
                        <th>Année Fin Reglement</th>
                        <th>Texte Loi</th>
                        <th>Article Loi</th>
                        <th>Paragraphe Loi</th>
                        <th>Ville</th>
                    </tr>
                </thead>
                <tbody>
                    {props.entetes.map((entete) => (
                        <tr key={entete.id_reg_stat} onClick={() => onLineSelect(entete.id_reg_stat)}>
                            <td>{entete.id_reg_stat}</td>
                            <td>{entete.description}</td>
                            <td>{entete.annee_debut_reg}</td>
                            <td>{entete.annee_fin_reg}</td>
                            <td>{entete.texte_loi}</td>
                            <td>{entete.article_loi}</td>
                            <td>{entete.paragraphe_loi}</td>
                            <td>{entete.ville_loi}</td>
                        </tr>
                        
                    ))}
                </tbody>
            </table>
        </div>
    );
};


export default TableEnteteReglements;