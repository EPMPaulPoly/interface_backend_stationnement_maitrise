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
    console.time('selectLotInventaire');
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
        console.time('fetchRegulations');
        const [reg, ensReg] = await Promise.all([
            serviceReglements.chercheReglementComplet(rulesToGet.length > 1 ? rulesToGet : rulesToGet[0]),
            serviceEnsemblesReglements.chercheEnsembleReglementParId(rulesetsToGet.length > 1 ? rulesetsToGet : rulesetsToGet[0])
        ]);
        console.timeEnd('fetchRegulations');

        props.defReglementsAnalyse(reg.data);
        props.defEnsemblesAnalyse(ensReg.data);
    } else {
        props.defInventaireAnalyse([]);
        props.defReglementsAnalyse([]);
        props.defEnsemblesAnalyse([]);
    }

    if (idLot) {
        console.time('fetchLotAndRole');
    
        // Find the lot from the features array
        const lot2 = props.lotsDuQuartier.features.find((o) => o.properties.g_no_lot === idLot);
    
        try {
            // Fetch the role associated with the lot ID
            const role = await serviceCadastre.chercheRoleAssocieParId(idLot);
    
            console.timeEnd('fetchLotAndRole');
            console.log('Obtenu lot', lot2);
            console.log('Obtenu role', role);
    
            // Set the lot and role for analysis
            if (lot2) {
                props.defLotAnalyse(lot2);
            } else {
                console.warn('Lot not found for idLot:', idLot);
            }
            props.defRoleAnalyse(role.data);
        } catch (error) {
            console.error('Error fetching role:', error);
            console.timeEnd('fetchLotAndRole');
        }
    }

    props.defRoleRegard('');
    props.defEnsRegRegard(-1);
    props.defRegRegard(-1);
    props.defMethodeEstimeRegard(-1);
    console.timeEnd('selectLotInventaire');
};


export default selectLotInventaire;