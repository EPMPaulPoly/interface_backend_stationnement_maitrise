import MenuBar from "../components/MenuBar";
import TableListeEnsReg from "../components/TableListeEnsReg";
import TableVisModEnsReg from "../components/TableVisEnsReg";
import { useState, useEffect, useRef } from "react";
import {useSearchParams} from 'react-router'
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
    const reglementCompletVide: ensemble_reglements_stationnement = {
        entete: enteteEnsemblevide,
        assoc_util_reg: [],
        table_util_sol:[],
        table_etendue:[]
    }

    const [enteteEnsembles, defEnteteEnsembles] = useState<entete_ensembles_reglement_stationnement[]>([]);
    const [charge, defCharg] = useState<boolean>(true);
    const [ensembleReglementComplet, defEnsembleReglementComplet] = useState<ensemble_reglements_stationnement>(reglementCompletVide);
    const [ancienEnsembleReglementComplet,defAncienEnsembleReglementComplet] = useState<ensemble_reglements_stationnement>(reglementCompletVide);
    const [reglementsPertinents,defRegPert] = useState<entete_reglement_stationnement[]>([]);
    const [editionEnteteEncours,defEditionEnteteEnCours] = useState<boolean>(false);
    const [editionCorpsEnCours,defEditionCorpsEnCours] = useState<boolean>(false);
    const [idAssocModifEncours,defIdAssocModifEnCours] = useState<number>(-1);
    const [searchParams] = useSearchParams();

    useEffect(() => {
    // code for handling search query change
    }, [searchParams]);
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
                    editionEnteteEnCours={editionEnteteEncours}
                    defEditionEnteteEnCours={defEditionEnteteEnCours}
                    editionCorpsEnCours={editionCorpsEnCours}
                    defEditionCorpsEnCours={defEditionCorpsEnCours}
                    ancienEnsRegComplet={ancienEnsembleReglementComplet}
                    defAncienEnsRegComplet={defAncienEnsembleReglementComplet}
                />


                <TableVisModEnsReg
                    charge={charge}
                    defCharge={defCharg}
                    ensembleReglement={ensembleReglementComplet}
                    defEnsembleReglement={defEnsembleReglementComplet}
                    entetesReglements={reglementsPertinents}
                    defEntetesReglements={defRegPert}
                    editionEnteteEnCours={editionEnteteEncours}
                    defEditionEnteteEnCours={defEditionEnteteEnCours}
                    editionCorpsEnCours={editionCorpsEnCours}
                    defEditionCorpsEnCours = {defEditionCorpsEnCours}
                    idAssociationEnEdition={idAssocModifEncours}
                    defIdAssociationEnEdition={defIdAssocModifEnCours}
                    entetesEnsRegListe={enteteEnsembles}
                    defEntetesEnsRegListe={defEnteteEnsembles}
                    ancienEnsRegComplet={ancienEnsembleReglementComplet}
                    defAncienEnsRegComplet={defAncienEnsembleReglementComplet}
                />
            </div>
        </div>
    )
}

export default EnsemblesReglements;