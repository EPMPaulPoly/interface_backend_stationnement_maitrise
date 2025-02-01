import React,{useState} from 'react';
import { entete_ensembles_reglement_stationnement } from '../types/DataTypes';


const EnsRegTerrGantt:React.FC =() =>{
    const [ensEnteteReg,defEnsReg] = useState<entete_ensembles_reglement_stationnement[]>([]);
    const getYearSpan = (): number[] => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = 1950; year <= currentYear; year++) {
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
                        <th>ID</th>
                        <th>Description</th>
                        <th>Annee Deb</th>
                        <th>Annee Fin</th>
                        {displayYears.map((item) => (<th className="year-header">{item}</th>))}
                    </tr>
                </thead>
                <tbody>
                    {ensEnteteReg.map((entete)=>(
                        <tr>
                            <td>{entete.description_er}</td>
                            <td>{entete.date_debut_er}</td>
                            <td>{entete.date_fin_er}</td>
                            {displayYears.map((annee)=>(
                                ((annee>=entete.date_debut_er) && (annee<=entete.date_debut_er))?<td className="annee-valide">x</td> :<td></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default EnsRegTerrGantt;