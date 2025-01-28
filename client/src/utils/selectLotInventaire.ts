import React from 'react';
import { LeafletEvent } from 'leaflet';
import { CarteInventaireProps,TableInventaireProps } from '../types/InterfaceTypes';
import { Feature, FeatureCollection,Geometry } from 'geojson';
import { inventaireGeoJSONProps } from '../types/DataTypes';
import { serviceReglements } from '../services';

const checkAvailable = (inventaireComplet: FeatureCollection<Geometry,inventaireGeoJSONProps>,key:string) : boolean =>{
    const check = inventaireComplet.features.find((o)=>o.properties.g_no_lot===key);
    if (check){
        return true
    } else {
        return false
    }

}

const selectLotInventaire = (inventaireComplet: FeatureCollection<Geometry,inventaireGeoJSONProps>,key:string): void => {
    if (checkAvailable(inventaireComplet,key)){
        const inventaireTest: FeatureCollection<Geometry, inventaireGeoJSONProps> = {
            type: "FeatureCollection",
            features: [{
            type: "Feature",
            geometry: checkAvailable(inventaireComplet,key) ? inventaireComplet.features.find((o) => o.properties.g_no_lot === key)?.geometry as Geometry : { type: "Point", coordinates: [0, 0] },
            properties: {
                g_no_lot:checkAvailable(inventaireComplet,key) ? inventaireComplet.features.find((o) => o.properties.g_no_lot === key)?.properties.g_no_lot ?? '' : '',
                n_places_min: checkAvailable(inventaireComplet,key) ? inventaireComplet.features.find((o) => o.properties.g_no_lot === key)?.properties.n_places_min ?? 0 : 0,
                n_places_max: checkAvailable(inventaireComplet,key) ? inventaireComplet.features.find((o) => o.properties.g_no_lot === key)?.properties.n_places_max ?? 0 : 0,
                n_places_estime: checkAvailable(inventaireComplet,key) ? inventaireComplet.features.find((o) => o.properties.g_no_lot === key)?.properties.n_places_estime ?? 0 : 0,
                n_places_mesure: checkAvailable(inventaireComplet,key) ? inventaireComplet.features.find((o) => o.properties.g_no_lot === key)?.properties.n_places_mesure ?? 0 : 0,
                methode_estime: checkAvailable(inventaireComplet,key) ? inventaireComplet.features.find((o) => o.properties.g_no_lot === key)?.properties.methode_estime ?? 0 : 0,
                cubf: checkAvailable(inventaireComplet,key) ? inventaireComplet.features.find((o) => o.properties.g_no_lot === key)?.properties.cubf ?? '' : '',
                id_er: checkAvailable(inventaireComplet,key) ? inventaireComplet.features.find((o) => o.properties.g_no_lot === key)?.properties.id_er ?? '' : '',
                id_reg_stat: checkAvailable(inventaireComplet,key) ? inventaireComplet.features.find((o) => o.properties.g_no_lot === key)?.properties.id_reg_stat ?? '' : ''
            }
            }]
        }
        const idRegStat = inventaireTest.features[0].properties.id_reg_stat || '';
        const rulesToGet = Array.from(new Set(idRegStat.split(/,|\//).map(Number)));
        const idEr = inventaireTest.features[0].properties.id_er || '';
        const rulesetsToGet = Array.from(new Set(idEr.split(/,|\//).map(Number)));
        console.log('Regles a obtenir: ',rulesToGet)
        console.log('Ens. Reg a obtenir: ',rulesetsToGet)
        console.log('Démarrage Service')
        if (rulesToGet.length>1){
            serviceReglements.chercheReglementComplet(rulesToGet)
        }else{
            serviceReglements.chercheReglementComplet(rulesToGet[0])
        }
    }
}


export default selectLotInventaire;