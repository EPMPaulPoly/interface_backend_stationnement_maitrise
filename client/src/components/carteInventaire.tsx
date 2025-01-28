import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { CarteInventaireProps } from '../types/InterfaceTypes';
import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import "leaflet/dist/leaflet.css";
import L, { LeafletEvent } from 'leaflet';
import { inventaireGeoJSONProps } from '../types/DataTypes';
import selectLotInventaire from '../utils/selectLotInventaire';

const CarteInventaire: React.FC<CarteInventaireProps> = (props) => {
  const handleLotClick= (e:LeafletEvent)=>{
    const key = e.target.feature.properties.g_no_lot;
    selectLotInventaire(props.inventaire as FeatureCollection<Geometry, inventaireGeoJSONProps>, key)
  }

  const geoJsonLayerGroupRef = useRef<L.LayerGroup | null>(null); // Refe

  const MapComponent = () => {
    const map = useMap(); // Access the map instance

    useEffect(() => {
      if (map) {
        if (geoJsonLayerGroupRef.current) {
          geoJsonLayerGroupRef.current.clearLayers(); // Clear previous vector layers
        }

        if (props.inventaire && props.inventaire.features.length > 0) {
          // Create a new GeoJSON layer from props.geoJsondata
          const geoJsonLayer = L.geoJSON(props.inventaire, {
            style: {
              color: 'blue', // Border color
              weight: 2,     // Border thickness
              fillColor: 'cyan', // Fill color
              fillOpacity: 0.5,  // Fill transparency
            },
            onEachFeature: (feature: any, layer: any) => {
              if (feature.properties) {
                const { g_no_lot, n_places_min, n_places_max } = feature.properties; // Destructure properties
                const formattedPopupContent = `
                        <strong>No Lot:</strong> ${g_no_lot} <br/>
                        <strong>Places Min:</strong> ${n_places_min} <br/>
                        <strong>Places Max:</strong> ${n_places_max} <br/>
                      `;
                layer.bindPopup(formattedPopupContent);
                layer.on({
                  click:  handleLotClick
                });
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
    }, [props.inventaire, map]); // Dependency on props.geoJsondata and map

    return null; // No need to render anything for the map component itself
  };

  return (<div className="carte-inventaire">
    <MapContainer
      center={props.startPosition}
      zoom={props.startZoom}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {props.inventaire && (<>
        {props.inventaire.features?.map((feature, index) => {
          //console.log(`Feature ${index + 1}:`, feature);
          return null; // We return null because we're only logging, not rendering anything here.
        })}
        <MapComponent />
      </>
      )}
    </MapContainer>
  </div>
  );
};

export default CarteInventaire;