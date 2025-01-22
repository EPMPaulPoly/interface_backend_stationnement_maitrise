import MenuBar from '../components/MenuBar';
import {ResizableBox} from 'react-resizable';
import {useState,useEffect} from 'react';
import {MapContainer,TileLayer} from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import TableInventaire from '../components/TableInventaire';
import { inventaire_stationnement, quartiers_analyse } from '../types/DataTypes';
import { serviceQuartiersAnalyse, } from '../services/serviceQuartiersAnalyse';
import {serviceInventaire} from '../services/serviceInventaire';
import { FeatureCollection,Geometry } from 'geojson';
import { inventaireGeoJSONProps } from '../types/DataTypes';
import CarteInventaire from '../components/carteInventaire';

const position: LatLngExpression = [45.5017, -73.5673]; // Montreal coordinates

const VisualisationInventaire: React.FC = () => {
    const[positionDepart,defPositionDepart] = useState<LatLngExpression>([46.85,-71]);
    const[zoomDepart,defZoomDepart] = useState<number>(10);
    const [quartier,defQuartierAnalyse] = useState<number>(-1);
    const [optionsQuartier,defOptionsQuartiers] = useState<quartiers_analyse[]>([]);
    const [inventaire,defInventaire] = useState<FeatureCollection<Geometry,inventaireGeoJSONProps>>({
        type: "FeatureCollection",
        features: []
    });
    const [itemSelect,defItemSelect] = useState<number>(-1);

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
                    <CarteInventaire
                        startPosition={positionDepart}
                        setStartPosition={defPositionDepart}
                        startZoom={zoomDepart}
                        setStartZoom={defZoomDepart}
                        inventaire={inventaire}
                        defInventaire={defInventaire}
                        itemSelect={itemSelect}
                        defItemSelect={defItemSelect}
                    />
                    
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