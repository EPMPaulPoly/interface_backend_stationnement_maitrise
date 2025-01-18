import React, { useState } from 'react';
import TableHistoire from '../components/TableHistoire';
import TableTerritoire from '../components/TableTerritoire';
import MenuBar from '../components/MenuBar';
import { ResizableBox } from 'react-resizable';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents,GeoJSON, Polygon, useMap } from 'react-leaflet';

import {LatLngExpression} from 'leaflet';
const position: LatLngExpression = [45.5017, -73.5673]; // Montreal coordinates

const Histoire: React.FC = () => {
    const [leftPanelWidth, setLeftPanelWidth] = useState(300); // Left panel width
    const [bottomPanelHeight, setBottomPanelHeight] = useState(200); // Bottom panel height

    const handleResizeLeftPanel = (e: any, data: any) => {
        setLeftPanelWidth(data.size.width); // Dynamically set width of left panel
    };

    const handleResizeBottomPanel = (e: any, data: any) => {
        setBottomPanelHeight(data.size.height); // Dynamically set height of bottom panel
    };

    return (
        <div className="page-histoire">
            <MenuBar/>
            <div className="histoire-dimensionnable">
                {/* Left Panel with the table */}
                <ResizableBox
                    className="histoire-barre-historique"
                    width={leftPanelWidth}
                    height={Infinity}
                    resizeHandles={['e']}
                    minConstraints={[150, Infinity]}
                    maxConstraints={[600, Infinity]}
                    onResizeStop={handleResizeLeftPanel}
                >
                    <TableHistoire />
                </ResizableBox>

                {/* Right Panel with map and table */}
                <div className="histoire-barre-droite">
                    <div className="histoire-carte-container">
                        
                            <MapContainer
                                center={position}
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                            </MapContainer>
                        
                    </div>
                    <ResizableBox className="histoire-barre-territoires-bas"
                    width={Infinity}
                    height={bottomPanelHeight}
                    resizeHandles={['n']}
                    minConstraints={[Infinity, 100]}
                    maxConstraints={[Infinity, 800]}
                    onResizeStop={handleResizeBottomPanel}>
                        <TableTerritoire />
                    </ResizableBox>
                </div>
            </div>
        </div>
    );
};

export default Histoire;
