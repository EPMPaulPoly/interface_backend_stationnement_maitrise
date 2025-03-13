import React from 'react';
import { LeafletEvent } from 'leaflet';
import {  selectLotProps } from '../types/utilTypes';
import { Feature, FeatureCollection,Geometry } from 'geojson';
import { inventaire_stationnement } from '../types/DataTypes';
import { serviceReglements,serviceCadastre, serviceEnsemblesReglements } from '../services';

const checkAvailable = (inventaireComplet: inventaire_stationnement[],key:string) : boolean =>{
    const check = inventaireComplet.find((o)=>o.g_no_lot===key);
    if (check){
        return true
    } else {
        return false
    }

}

const selectLotInventaire = async (props: selectLotProps): Promise<void> => {
    const idLot = props.numLot;
    let inventaireTest: inventaire_stationnement[] = [];

    if (checkAvailable(props.inventaireComplet, idLot)) {
        inventaireTest = props.inventaireComplet.filter(o => o.g_no_lot === idLot);
        props.defInventaireAnalyse(inventaireTest);

        const idRegStat = inventaireTest.find(o => o.methode_estime === 2)?.id_reg_stat || '';
        const rulesToGet = Array.from(new Set(idRegStat.split(/,|\//).map(Number)));
        const idEr = inventaireTest.find(o => o.methode_estime === 2)?.id_er || '';
        const rulesetsToGet = Array.from(new Set(idEr.split(/,|\//).map(Number)));

        console.log('Regles a obtenir: ', rulesToGet);
        console.log('Ens. Reg a obtenir: ', rulesetsToGet);
        console.log('Démarrage Service');

        const [reg, ensReg] = await Promise.all([
            serviceReglements.chercheReglementComplet(rulesToGet.length > 1 ? rulesToGet : rulesToGet[0]),
            serviceEnsemblesReglements.chercheEnsembleReglementParId(rulesetsToGet.length > 1 ? rulesetsToGet : rulesetsToGet[0])
        ]);

        props.defReglementsAnalyse(reg.data);
        props.defEnsemblesAnalyse(ensReg.data);
    } else {
        props.defInventaireAnalyse([]);
        props.defReglementsAnalyse([]);
        props.defEnsemblesAnalyse([]);
    }

    if (idLot) {
        const [lot, role] = await Promise.all([
            serviceCadastre.obtiensCadastreParId(idLot),
            serviceCadastre.chercheRoleAssocieParId(idLot)
        ]);

        console.log('Obtenu lot', lot);
        console.log('Obtenu role', role);

        props.defLotAnalyse(lot.data);
        props.defRoleAnalyse(role.data);
    }

    props.defRoleRegard('');
    props.defEnsRegRegard(-1);
    props.defRegRegard(-1);
    props.defMethodeEstimeRegard(-1);
};


export default selectLotInventaire;