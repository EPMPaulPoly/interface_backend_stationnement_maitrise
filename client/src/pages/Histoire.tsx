import React, { useState } from 'react';
import TableHistoire from '../components/TableHistoire';
import TableTerritoire from '../components/TableTerritoire';
import MenuBar from '../components/MenuBar';
import { ResizableBox } from 'react-resizable';
import CarteHistorique from '../components/carteHistorique';
import { territoire } from '../types/DataTypes';
import {LatLngExpression} from 'leaflet';

const Histoire: React.FC = () => {
    const[positionDepart,defPositionDepart] = useState<LatLngExpression>([45.5017, -73.5673]);
    const[zoomDepart,defZoomDepart] = useState<number>(13);
    const[etatTerritoire,defTerritoire] = useState<territoire[]>([]);
    const[territoireSelect,defTerritoireSelect] = useState<number>(-1);
    const[periodeSelect,defPeriodeSelect]= useState<number>(-1);
    return (
        <div className="page-histoire">
            <MenuBar/>
            <div className="histoire-dimensionnable">
                {/* Left Panel with the table */}
                <div className="histoire-barre-historique">
                    <TableHistoire
                        periodeSelect={periodeSelect}
                        defPeriodeSelect={defPeriodeSelect} />
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
                    <TableTerritoire />
                </div>
            </div>
        </div>
    );
};

export default Histoire;
