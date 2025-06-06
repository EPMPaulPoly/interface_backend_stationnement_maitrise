import React, { useState,useEffect } from 'react';
import TableHistoire from '../components/TableHistoire';
import TableTerritoire from '../components/TableTerritoire';
import MenuBar from '../components/MenuBar';
import { ResizableBox } from 'react-resizable';
import CarteHistorique from '../components/carteHistorique';
import { territoire ,territoireGeoJsonProperties} from '../types/DataTypes';
import {LatLngExpression} from 'leaflet';
import { serviceHistorique } from '../services';
import { serviceTerritoires } from '../services';
import { FeatureCollection,Geometry } from 'geojson';
import './common.css';
import './histoire.css'

const Histoire: React.FC = () => {
    const[positionDepart,defPositionDepart] = useState<LatLngExpression>([46.85,-71]);
    const[zoomDepart,defZoomDepart] = useState<number>(10);
    const[etatTerritoire,defTerritoire] = useState<GeoJSON.FeatureCollection<Geometry,territoireGeoJsonProperties>>({
        type: "FeatureCollection",
        features: []
    });
    const[territoireSelect,defTerritoireSelect] = useState<number>(-1);
    const[periodeSelect,defPeriodeSelect]= useState<number>(-1);
    
    const testGeoJSON:FeatureCollection<Geometry,territoireGeoJsonProperties> = {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [-71.2, 46.9],
                                [-71.1, 46.9],
                                [-71.1, 46.8],
                                [-71.2, 46.8],
                                [-71.2, 46.9]
                            ]
                        ]
                    },
                    properties: {
                        id_periode_geo: 0,
                        id_periode:0,
                        ville: "Test Polygon",
                        secteur:"test secteur"
                    }
                }
            ]
        };
    

    const setGeoJsonTest = () =>{
        defTerritoire(testGeoJSON)
    }

    
    
    return (
        <div className="page-histoire">
            <MenuBar/>
            <div className="histoire-dimensionnable">
                {/* Left Panel with the table */}
                <div className="histoire-barre-historique">
                    <TableHistoire
                        periodeSelect={periodeSelect}
                        defPeriodeSelect={defPeriodeSelect}
                        territoires={etatTerritoire}
                        defTerritoires={defTerritoire} />
                </div>

                {/* Right Panel with map and table */}
                <div className="histoire-barre-droite">
                    <div className="histoire-carte-container">
                        <CarteHistorique 
                            territoires={etatTerritoire}
                            defTerritoires={defTerritoire}
                            territoireSelect={territoireSelect}
                            defTerritoireSelect={defTerritoireSelect}
                            startPosition={positionDepart}
                            setStartPosition={defPositionDepart}
                            startZoom={zoomDepart}
                            setStartZoom={defZoomDepart}
                        />                        
                    </div>
                    <TableTerritoire
                        territoires={etatTerritoire}
                        defTerritoire={defTerritoire} />
                </div>
            </div>
        </div>
    );
};

export default Histoire;
