import MenuBar from "../components/MenuBar";
import TableListeEnsReg from "../components/TableListeEnsReg";
import TableVisModEnsReg from "../components/TableVisEnsReg";
import { useState, useEffect, useRef } from "react";
import {  association_util_reglement, ensemble_reglements_stationnement, entete_reglement_stationnement } from "../types/DataTypes";
import { entete_ensembles_reglement_stationnement } from "../types/DataTypes";
import './ensemblereg.css'
import './common.css'

const EnsemblesReglements: React.FC = () => {
    const enteteEnsemblevide: entete_ensembles_reglement_stationnement = {
        id_er:0,
        date_debut_er:0,
        date_fin_er:0,
        description_er:'',
    };
    const associationVide: association_util_reglement = {
        id_assoc_er_reg:0,
        cubf:0,
        id_reg_stat:0,
        id_er:0
    }

    const reglementCompletVide: ensemble_reglements_stationnement = {
        entete: enteteEnsemblevide,
        assoc_util_reg: [associationVide],
        table_util_sol:[],
        table_etendue:[]
    }

    const [enteteEnsembles, defEnteteEnsembles] = useState<entete_ensembles_reglement_stationnement[]>([]);
    const [charge, defCharg] = useState<boolean>(true);
    const [ensembleReglementComplet, defEnsembleReglementComplet] = useState<ensemble_reglements_stationnement[]>([reglementCompletVide]);
    const [reglementsPertinents,defRegPert] = useState<entete_reglement_stationnement[]>([]);


    return (
        <div className="page-creation-ens-reg">
            <MenuBar />
            <div className="ens-reg-conteneur-row">
                    <TableListeEnsReg
                        entetesEnsembles={enteteEnsembles}
                        defEntetesEnsembles={defEnteteEnsembles}
                        ensembleReglement={ensembleReglementComplet}
                        defEnsembleReglement={defEnsembleReglementComplet}
                        entetesReglements={reglementsPertinents}
                        defEntetesReglements={defRegPert}
                    />


                {<TableVisModEnsReg
                    charge={charge}
                    defCharge={defCharg}
                    ensembleReglement={ensembleReglementComplet}
                    defEnsembleReglement={defEnsembleReglementComplet}
                    entetesReglements={reglementsPertinents}
                    defEntetesReglements={defRegPert}
                />}
            </div>
        </div>
    )
}

export default EnsemblesReglements;