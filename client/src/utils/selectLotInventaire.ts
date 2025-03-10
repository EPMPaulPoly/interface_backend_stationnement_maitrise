import React from 'react';
import { LeafletEvent } from 'leaflet';
import {  selectLotProps } from '../types/InterfaceTypes';
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

const selectLotInventaire = async (props:selectLotProps): Promise<void> => {
    if (checkAvailable(props.inventaireComplet,props.numLot)){
        const inventaireTest:inventaire_stationnement[] = props.inventaireComplet.filter((o)=>o.g_no_lot===props.numLot)
            
        props.defInventaireAnalyse(inventaireTest)
        const idRegStat = inventaireTest.find((o)=>o.methode_estime===2)?.id_reg_stat || '';
        const rulesToGet = Array.from(new Set(idRegStat.split(/,|\//).map(Number)));
        const idEr = inventaireTest.find((o)=>o.methode_estime===2)?.id_er || '';
        const rulesetsToGet = Array.from(new Set(idEr.split(/,|\//).map(Number)));
        console.log('Regles a obtenir: ',rulesToGet)
        console.log('Ens. Reg a obtenir: ',rulesetsToGet)
        console.log('Démarrage Service')
        if (rulesToGet.length>1){
            const reg = await serviceReglements.chercheReglementComplet(rulesToGet);
            props.defReglementsAnalyse(reg.data);
        }else{
            const reg = await serviceReglements.chercheReglementComplet(rulesToGet[0])
            props.defReglementsAnalyse(reg.data);
        }
        if (rulesetsToGet.length>1){
            const ensReg = await serviceEnsemblesReglements.chercheEnsembleReglementParId(rulesetsToGet);
            props.defEnsemblesAnalyse(ensReg.data);
        }else{
            const ensReg = await serviceEnsemblesReglements.chercheEnsembleReglementParId(rulesetsToGet[0])
            props.defEnsemblesAnalyse(ensReg.data);
        }
        const idLot = inventaireTest.find((o)=>o.methode_estime===2)?.g_no_lot
        if (idLot){
            const lot = await serviceCadastre.obtiensCadastreParId(idLot)
            const role = await serviceCadastre.chercheRoleAssocieParId(idLot)
            console.log('Obtenu lot',lot) 
            console.log('Obtenu role',role)
            props.defLotAnalyse(lot.data)
            props.defRoleAnalyse(role.data)
        }
        props.defRoleRegard('')
        props.defEnsRegRegard(-1)
        props.defRegRegard(-1)
        props.defMethodeEstimeRegard(-1)
    }
}


export default selectLotInventaire;