import MenuBar from '../components/MenuBar';
import {ResizableBox} from 'react-resizable';
import {useState,useEffect} from 'react';
import {MapContainer,TileLayer} from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import TableInventaire from '../components/TableInventaire';
import { inventaire_stationnement, quartiers_analyse } from '../types/DataTypes';
import { serviceQuartiersAnalyse, } from '../services/serviceQuartiersAnalyse';
import {serviceInventaire} from '../services/serviceInventaire';

const position: LatLngExpression = [45.5017, -73.5673]; // Montreal coordinates

const VisualisationInventaire: React.FC = () => {
    const [quartier,defQuartierAnalyse] = useState<number>(-1);
    const [optionsQuartier,defOptionsQuartiers] = useState<quartiers_analyse[]>([]);
    const [inventaire,defInventaire] = useState<inventaire_stationnement[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const quartiers = await serviceQuartiersAnalyse.chercheTousQuartiersAnalyse();
            defOptionsQuartiers(quartiers.data);
            if (quartier !== -1){
                const inventaire = await serviceInventaire.obtientInventaireParQuartier(quartier)
            }
        };
        fetchData();
    }, []);

    return (
        <div className="page-inventaire">
            <MenuBar/>
                <div className="inventaire-carte-conteneur">
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
                    <TableInventaire
                        quartier={quartier}
                        defQuartier={defQuartierAnalyse}
                        optionsQuartiers={optionsQuartier}
                        defOptionsQuartiers={defOptionsQuartiers}
                        inventaire={inventaire}
                        defInventaire={defInventaire} />
                </div>

    );
};

export default VisualisationInventaire;