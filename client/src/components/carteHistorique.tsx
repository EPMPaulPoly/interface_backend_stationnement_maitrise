import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents,GeoJSON, Polygon, useMap } from 'react-leaflet';
import { CarteHistoriqueProps } from '../types/InterfaceTypes';
const CarteHistorique:React.FC<CarteHistoriqueProps> = (props) =>{
    return(
        <MapContainer
            center={props.startPosition}
            zoom={props.startZoom}
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
        </MapContainer>
    )
}

export default CarteHistorique;