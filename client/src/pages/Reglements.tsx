import MenuBar from "../components/MenuBar";
import TableEnteteReglements from "../components/TableEnteteReglements";
import TableVisModReglement from "../components/tableVisReglement";
import { useState, useEffect, useRef } from "react";
import { entete_reglement_stationnement, definition_reglement_stationnement, reglement_complet } from "../types/DataTypes";
import './reg.css';
import './common.css';


const Reglements: React.FC = () => {
    const enteteReglementVide: entete_reglement_stationnement = {
        id_reg_stat: 0,
        description: '',
        annee_debut_reg: 0,
        annee_fin_reg: 0,
        texte_loi: '',
        article_loi: '',
        paragraphe_loi: '',
        ville: ''
    };
    const definitionReglementVide: definition_reglement_stationnement = {
        id_reg_stat: 0,
        id_reg_stat_emp: 0,
        ss_ensemble: 0,
        oper: 0,
        seuil: 0,
        cases_fix_min: 0,
        cases_fix_max: 0,
        pente_min: 0,
        pente_max: 0,
        unite: 0
    }

    const reglementCompletVide: reglement_complet = {
        entete: enteteReglementVide,
        definition: [definitionReglementVide]
    }

    const [entetes, defEntetes] = useState<entete_reglement_stationnement[]>([]);
    const [charge, defCharg] = useState<boolean>(true);
    const [reglementComplet, defReglementComplet] = useState<reglement_complet>(reglementCompletVide);
    const [creation,defCreation] = useState<boolean>(false);
    const [editionEnteteEnCours,defEditionEnteteEnCours] = useState<boolean>(false);
    const [editionCorpsEnCours,defEditionCorpsEnCours] = useState<boolean>(false);
    return (
        <div className="page-creation-reglements">
            <MenuBar />
            <div className="conteneur-table-liste-entete">
                <TableEnteteReglements
                    entetes={entetes}
                    defEntetes={defEntetes}
                    charge={charge}
                    defCharge={defCharg}
                    regSelect={reglementComplet}
                    defRegSelect={defReglementComplet}
                    creationEnCours={creation}
                    defCreationEnCours={defCreation}
                    editionEnteteEnCours={editionEnteteEnCours}
                    defEditionEnteteEnCours={defEditionEnteteEnCours}
                    editionCorpsEnCours={editionCorpsEnCours}
                    defEditionCorpsEnCours={defEditionCorpsEnCours}
                />
            </div>

            <TableVisModReglement
                charge={charge}
                defCharge={defCharg}
                regSelect={reglementComplet}
                defRegSelect={defReglementComplet}
                creationEnCours={creation}
                defCreationEnCours={defCreation}
                editionEnteteEnCours={editionEnteteEnCours}
                defEditionEnteteEnCours={defEditionEnteteEnCours}
                editionCorpsEnCours={editionCorpsEnCours}
                defEditionCorpsEnCours={defEditionCorpsEnCours}
                entetesRegStationnement={entetes}
                defEntetesRegStationnement={defEntetes  }
            />

        </div>
    )
}

export default Reglements;