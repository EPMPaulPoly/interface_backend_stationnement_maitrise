import React,{useRef,useEffect} from 'react';
import { CarteEnsRegTerrProps } from '../types/InterfaceTypes';
import { MapContainer, TileLayer,GeoJSON,useMap } from 'react-leaflet';
import L from 'leaflet';

const CarteEnsRegTerr:React.FC<CarteEnsRegTerrProps>=(props:CarteEnsRegTerrProps)=>{
    const geoJsonLayerGroupRef = useRef<L.LayerGroup | null>(null); // Refe
    const MapComponent = () => {
            const map = useMap(); // Access the map instance
        
            useEffect(() => {
              if (map) {
                if (geoJsonLayerGroupRef.current) {
                  geoJsonLayerGroupRef.current.clearLayers(); // Clear previous vector layers
                }
        
                if (props.territoireSelect && props.territoireSelect.features && props.territoireSelect.features.length > 0) {
                  // Create a new GeoJSON layer from props.geoJsondata
                  const geoJsonLayer = L.geoJSON(props.territoireSelect, {
                    style: {
                      color: 'blue', // Border color
                      weight: 2,     // Border thickness
                      fillColor: 'cyan', // Fill color
                      fillOpacity: 0.5,  // Fill transparency
                    },
                    onEachFeature: (feature: any, layer: any) => {
                        if (feature.properties) {
                          const { id_periode_geo, secteur, ville } = feature.properties; // Destructure properties
                          const formattedPopupContent = `
                            <strong>Feature ID:</strong> ${id_periode_geo} <br/>
                            <strong>Name:</strong> ${ville} <br/>
                            <strong>Secteur:</strong> ${secteur} <br/>
                          `;
                          layer.bindPopup(formattedPopupContent);
                        }
                      }
                  });
        
                  if (!geoJsonLayerGroupRef.current) {
                    geoJsonLayerGroupRef.current = L.layerGroup().addTo(map); // Create the layer group if it doesn't exist
                  }
        
                  geoJsonLayer.addTo(geoJsonLayerGroupRef.current); // Add the new layer to the group
        
                  // Optionally, adjust the map bounds to fit the new GeoJSON data
                  const bounds = geoJsonLayer.getBounds();
                  map.fitBounds(bounds);
                }
              }
            }, [props.territoireSelect, map]); // Dependency on props.geoJsondata and map
        
            return null; // No need to render anything for the map component itself
          };
    
    return(
        <div className="div-carte-ens-reg-terr">
        <MapContainer
            center={props.centre}
            zoom={props.zoom}
            style={{ height: '100%', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapComponent/>
        </MapContainer>
        </div>
    )

}

export default CarteEnsRegTerr;