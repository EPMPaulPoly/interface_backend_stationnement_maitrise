import React from 'react';
import { LeafletEvent } from 'leaflet';
import {  selectLotProps } from '../types/InterfaceTypes';
import { Feature, FeatureCollection,Geometry } from 'geojson';
import { inventaireGeoJSONProps } from '../types/DataTypes';
import { serviceReglements,serviceCadastre, serviceEnsemblesReglements } from '../services';

const checkAvailable = (inventaireComplet: FeatureCollection<Geometry,inventaireGeoJSONProps>,key:string) : boolean =>{
    const check = inventaireComplet.features.find((o)=>o.properties.g_no_lot===key);
    if (check){
        return true
    } else {
        return false
    }

}

const selectLotInventaire = async (props:selectLotProps): Promise<void> => {
    if (checkAvailable(props.inventaireComplet,props.numLot)){
        const inventaireTest: FeatureCollection<Geometry, inventaireGeoJSONProps> = {
            type: "FeatureCollection",
            features: [{
            type: "Feature",
            geometry: checkAvailable(props.inventaireComplet,props.numLot) ? props.inventaireComplet.features.find((o) => o.properties.g_no_lot === props.numLot)?.geometry as Geometry : { type: "Point", coordinates: [0, 0] },
            properties: {
                g_no_lot:checkAvailable(props.inventaireComplet,props.numLot) ? props.inventaireComplet.features.find((o) => o.properties.g_no_lot === props.numLot)?.properties.g_no_lot ?? '' : '',
                n_places_min: checkAvailable(props.inventaireComplet,props.numLot) ? props.inventaireComplet.features.find((o) => o.properties.g_no_lot === props.numLot)?.properties.n_places_min ?? 0 : 0,
                n_places_max: checkAvailable(props.inventaireComplet,props.numLot) ? props.inventaireComplet.features.find((o) => o.properties.g_no_lot === props.numLot)?.properties.n_places_max ?? 0 : 0,
                n_places_estime: checkAvailable(props.inventaireComplet,props.numLot) ? props.inventaireComplet.features.find((o) => o.properties.g_no_lot === props.numLot)?.properties.n_places_estime ?? 0 : 0,
                n_places_mesure: checkAvailable(props.inventaireComplet,props.numLot) ? props.inventaireComplet.features.find((o) => o.properties.g_no_lot === props.numLot)?.properties.n_places_mesure ?? 0 : 0,
                methode_estime: checkAvailable(props.inventaireComplet,props.numLot) ? props.inventaireComplet.features.find((o) => o.properties.g_no_lot === props.numLot)?.properties.methode_estime ?? 0 : 0,
                cubf: checkAvailable(props.inventaireComplet,props.numLot) ? props.inventaireComplet.features.find((o) => o.properties.g_no_lot === props.numLot)?.properties.cubf ?? '' : '',
                id_er: checkAvailable(props.inventaireComplet,props.numLot) ? props.inventaireComplet.features.find((o) => o.properties.g_no_lot === props.numLot)?.properties.id_er ?? '' : '',
                id_reg_stat: checkAvailable(props.inventaireComplet,props.numLot) ? props.inventaireComplet.features.find((o) => o.properties.g_no_lot === props.numLot)?.properties.id_reg_stat ?? '' : ''
            }
            }]
        }
        props.defInventaireAnalyse(inventaireTest)
        const idRegStat = inventaireTest.features[0].properties.id_reg_stat || '';
        const rulesToGet = Array.from(new Set(idRegStat.split(/,|\//).map(Number)));
        const idEr = inventaireTest.features[0].properties.id_er || '';
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
            const ensReg = await serviceEnsemblesReglements.chercheEnsembleReglementParId(rulesToGet);
            props.defEnsemblesAnalyse(ensReg.data);
        }else{
            const ensReg = await serviceEnsemblesReglements.chercheEnsembleReglementParId(rulesToGet[0])
            props.defEnsemblesAnalyse(ensReg.data);
        }
        const idLot = inventaireTest.features[0].properties.g_no_lot
        const lot = await serviceCadastre.obtiensCadastreParId(idLot)
        const role = await serviceCadastre.chercheRoleAssocieParId(idLot)
        console.log('Obtenu lot',lot) 
        console.log('Obtenu role',role)
        props.defLotAnalyse(lot.data)
        props.defRoleAnalyse(role.data)

    }
}


export default selectLotInventaire;