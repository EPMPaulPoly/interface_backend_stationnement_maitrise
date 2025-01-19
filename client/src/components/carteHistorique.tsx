import React, { useEffect, useState,useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON ,useMap} from 'react-leaflet';
import { CarteHistoriqueProps } from '../types/InterfaceTypes';
import { territoire } from '../types/DataTypes';
import { FeatureCollection,Geometry } from 'geojson';
import "leaflet/dist/leaflet.css";
import L from 'leaflet';

const CarteHistorique: React.FC<CarteHistoriqueProps> = (props) => {
    

    console.log('Map received  zone data:', JSON.stringify(props.geoJsondata, null, 0));
    const geoJsonLayerGroupRef = useRef<L.LayerGroup | null>(null); // Refe
  
    const MapComponent = () => {
        const map = useMap(); // Access the map instance
    
        useEffect(() => {
          if (map) {
            if (geoJsonLayerGroupRef.current) {
              geoJsonLayerGroupRef.current.clearLayers(); // Clear previous vector layers
            }
    
            if (props.geoJsondata && props.geoJsondata.features.length > 0) {
              // Create a new GeoJSON layer from props.geoJsondata
              const geoJsonLayer = L.geoJSON(props.geoJsondata, {
                style: {
                  color: 'blue', // Border color
                  weight: 2,     // Border thickness
                  fillColor: 'cyan', // Fill color
                  fillOpacity: 0.5,  // Fill transparency
                },
                onEachFeature: (feature: any, layer: any) => {
                    if (feature.properties) {
                      const { id, name, secteur, ville } = feature.properties; // Destructure properties
                      const formattedPopupContent = `
                        <strong>Feature ID:</strong> ${id} <br/>
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
        }, [props.geoJsondata, map]); // Dependency on props.geoJsondata and map
    
        return null; // No need to render anything for the map component itself
      };

    const testGeoJSON:FeatureCollection<Geometry> = {
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        geometry: {
                            type: "MultiPolygon",
                            coordinates: [[
                                [
                                    [-71.3, 47],
                                    [-71.2, 47],
                                    [-71.2, 46.9],
                                    [-71.3, 46.9],
                                    [-71.3, 47]
                                ],
                                [
                                    [-71.4, 47],
                                    [-71.3, 47],
                                    [-71.3, 46.9],
                                    [-71.4, 46.9],
                                    [-71.4, 47]
                                ]
                            ]]
                        },
                        properties: {
                            id: "test",
                            name: "Test Polygon"
                        }
                    }
                ]
            };
    
    return (<>
        <MapContainer
            center={props.startPosition}
            zoom={props.startZoom}
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {props.geoJsondata && (<>
                {props.geoJsondata.features?.map((feature, index) => {
                    console.log(`Feature ${index + 1}:`, feature);
                return null; // We return null because we're only logging, not rendering anything here.
                })}
                <MapComponent/>
                </>
            )}
            
            
        </MapContainer>
        
        </>
    );
};

export default CarteHistorique;