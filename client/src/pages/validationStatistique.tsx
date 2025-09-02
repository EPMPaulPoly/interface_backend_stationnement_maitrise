import React, { useEffect, useState } from 'react';
import MenuBar from '../components/MenuBar';
import './common.css';
import './validationStatistique.css'
import ControlValStat from '../components/ControlValStat';
import ModifStrates from '../components/modifStrates';
import { Strate } from '../types/DataTypes';
import DefinitionStratesEchantionnage from '../components/definitionStratesEchantionnage';
import serviceValidation from '../services/serviceValidation';

const ValidationStatistique: React.FC = () => {
    const [definitionStrate, defDefinitionStrate] = useState<boolean>(false);
    const [strateActuelle, defStrateActuelle] = useState<Strate>({
        id_strate: 0,
        nom_strate: 'logement',
        nom_colonne: 'cubf',
        nom_table: 'test',
        est_racine: true,
        index_ordre: 0,
        id_enfants: [2, 3],
        condition: {
            condition_type: "range",
            condition_min: 1000,
            condition_max: 1999
        }
    })
    const [toutesStrates, defToutesStrates] = useState<Strate[]>(
        [{
            id_strate: 0,
            nom_strate: 'logement',
            nom_colonne: 'cubf',
            nom_table: 'test',
            est_racine: true,
            index_ordre: 0,
            id_enfants: [2, 3],
            condition: {
                condition_type: "range",
                condition_min: 1000,
                condition_max: 1999
            },
            subStrata: [
                {
                    id_strate: 2,
                    nom_strate: 'unifamiliaL',
                    nom_colonne: 'n_logements',
                    nom_table: 'test',
                    est_racine: true,
                    index_ordre: 0,
                    id_enfants: null,
                    condition: {
                        condition_type: "equals",
                        condition_valeur: 1
                    },
                    n_sample: 30
                },
                {
                    id_strate: 3,
                    nom_strate: 'plex',
                    nom_colonne: 'n_logements',
                    nom_table: 'test',
                    est_racine: true,
                    index_ordre: 0,
                    id_enfants: null,
                    condition: {
                        condition_type: "range",
                        condition_min: 2,
                        condition_max: 2000
                    },
                    n_sample: 30
                }
            ]
        }, {
            id_strate: 1,
            nom_strate: 'industriel',
            nom_colonne: 'cubf',
            nom_table: 'test',
            est_racine: true,
            index_ordre: 0,
            id_enfants: null,
            condition: {
                condition_type: "range",
                condition_min: 2000,
                condition_max: 2999
            },
            n_sample: 30
        }]
    );
    const [anciennesStrates,defAnciennesStrates] = useState<Strate[]>([]);
    const [ancienneStrateAct,defAncienneStrateAct] = useState<Strate>({
        id_strate:-1,
        nom_colonne:'',
        nom_table:'',
        nom_strate:'',
        n_sample:0,
        id_enfants:null,
        est_racine:false,
        index_ordre:0,
        condition:{
            condition_type:'equals',
            condition_valeur:0
        }
    })
    const [strateParent,defStrateParent] = useState<number|null>(null);
    

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resStrates = await serviceValidation.obtiensStrates();
                console.log('Recu les strates', resStrates);
                defToutesStrates(resStrates.data)
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                //props.defCharge(false);
            }
        };

        fetchData();
    }, []); // Empty dependency array means this runs once when the component mounts
    return (
        <div className='page-validation-stat'>
            <MenuBar />
            <ControlValStat
                definitionStrate={definitionStrate}
                defDefinitionStrate={defDefinitionStrate}
            />
            {definitionStrate === true ?
                <DefinitionStratesEchantionnage
                    strateActuelle={strateActuelle}
                    defStrateActuelle={defStrateActuelle}
                    strates={toutesStrates}
                    defStrates={defToutesStrates}
                    anciennesStrates={anciennesStrates}
                    defAnciennesStrates={defAnciennesStrates}
                    ancienneStrateAct={ancienneStrateAct}
                    defAncienneStrateAct={defAncienneStrateAct}
                    idParent={strateParent}
                    defIdParent={defStrateParent}
                />
                :
                <></>
            }
        </div>
    )
}

export default ValidationStatistique