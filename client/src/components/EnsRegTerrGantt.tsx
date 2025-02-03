import React,{useState} from 'react';
import { entete_ensembles_reglement_stationnement } from '../types/DataTypes';
import { EnsRegTerrDispTable } from '../types/InterfaceTypes';


const EnsRegTerrGantt:React.FC<EnsRegTerrDispTable> =(props:EnsRegTerrDispTable) =>{
    const getYearSpan = (): number[] => {
        const years = [];
        let startYear = 1950;
        let endYear = new Date().getFullYear();
        if (props.periodeSelect.id_periode!=-1){
            if (props.periodeSelect.date_debut_periode!=0){
                startYear = props.periodeSelect.date_debut_periode;
            }
            if (props.periodeSelect.date_fin_periode!=null){
                endYear = props.periodeSelect.date_fin_periode;
            }
        }
        for (let year = startYear; year <= endYear; year++) {
            years.push(year);
        }
        return years;
        
    };
    const displayYears = getYearSpan();
    return(
        <div className="gantt-ens-reg-terr">
            <table className="table-vis-assoc-terr-ens-reg">
                <thead>
                    <tr>
                        <th className="id-col sticky-col">ID</th>
                        <th className="desc-col sticky-col">Description</th>
                        <th className="start-col sticky-col">Annee Deb</th>
                        <th className="end-col sticky-col">Annee Fin</th>
                        {displayYears.map((item) => (<th><div className="year-header">{item}</div></th>))}
                    </tr>
                </thead>
                <tbody>
                    {props.ensRegDispo.map((entete)=>(
                        <tr>
                            <td className="id-col sticky-col">{entete.id_er}</td>
                            <td className="desc-col sticky-col">{entete.description_er}</td>
                            <td className="start-col sticky-col">{entete.date_debut_er}</td>
                            <td className="end-col sticky-col">{entete.date_fin_er}</td>
                            {displayYears.map((annee)=>(
                                ((annee>=entete.date_debut_er || entete.date_debut_er===null) && (annee<=entete.date_fin_er || entete.date_fin_er===null))?<td className="annee-valide">x</td> :<td className="annee-invalide"></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default EnsRegTerrGantt;