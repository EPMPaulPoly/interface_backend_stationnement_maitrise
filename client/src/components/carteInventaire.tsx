import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { CarteInventaireProps } from '../types/InterfaceTypes';
import "leaflet/dist/leaflet.css";
import L, { LeafletEvent } from 'leaflet';
import selectLotInventaire from '../utils/selectLotInventaire';
import { selectLotProps } from '../types/utilTypes';
import {  lotCadastralAvecBoolInvGeoJsonProperties } from '../types/DataTypes';
import chroma from 'chroma-js';
const CarteInventaire: React.FC<CarteInventaireProps> = (props) => {
  const handleLotClick = (e: LeafletEvent) => {
    const key = e.target.feature.properties.g_no_lot;
    const propsLot: selectLotProps = {
      inventaireComplet: props.inventaire,
      numLot: key,
      lotAnalyse: props.lotSelect,
      defLotAnalyse: props.defLotSelect,
      inventaireAnalyse: props.itemSelect,
      defInventaireAnalyse: props.defItemSelect,
      roleAnalyse: props.donneesRole,
      defRoleAnalyse: props.defDonneesRole,
      reglementsAnalyse: props.reglements,
      defReglementsAnalyse: props.defReglements,
      ensemblesAnalyse: props.ensemblesReglements,
      defEnsemblesAnalyse: props.defEnsemblesReglements,
      methodeEstimeRegard: props.methodeEstimeRegard,
      defMethodeEstimeRegard: props.defMethodeEstimeRegard,
      regRegard: props.regRegard,
      defRegRegard: props.defRegRegard,
      ensRegRegard: props.ensRegRegard,
      defEnsRegRegard: props.defEnsRegRegard,
      roleRegard: props.roleRegard,
      defRoleRegard: props.defRoleRegard,
      lotsDuQuartier: props.lotsDuQuartier
    }
    selectLotInventaire(propsLot)
  }

  const geoJsonLayerGroupRef = useRef<L.LayerGroup | null>(null); // Refe
  const prevInventaireRef = useRef<GeoJSON.FeatureCollection<GeoJSON.Geometry, lotCadastralAvecBoolInvGeoJsonProperties> | null>(null);
  const MapComponent = () => {
    const map = useMap(); // Access the map instance

    useEffect(() => {
      if (map) {
        if (geoJsonLayerGroupRef.current) {
          geoJsonLayerGroupRef.current.clearLayers(); // Clear previous vector layers
        }

        if (props.lotsDuQuartier && props.lotsDuQuartier.features.length > 0) {
          // Create a new GeoJSON layer from props.geoJsondata
          const lotsAMontrer = !props.montrerTousLots? props.lotsDuQuartier.features.filter((o)=>o.properties.bool_inv===true):props.lotsDuQuartier;
          // Extract min/max dynamically from the dataset
          const values = props.inventaire.map(f => Math.max(f.n_places_min,f.n_places_min,f.n_places_estime));
          const minValue = Math.min(...values);
          const maxValue = Math.max(...values);
          // Create a color scale from light yellow to dark red
          const colorScale = chroma.scale(['#FFEDA0', '#E31A1C', '#800026']).domain([minValue, maxValue]);
          console.log('échelle')
          const geoJsonLayer = L.geoJSON(lotsAMontrer, {
            style: (feature) => {
              const isLotInAnalyse = feature && props.lotSelect.properties.g_no_lot===feature.properties.g_no_lot;
              const hasInventaire = props.inventaire.find((item)=>item.g_no_lot===feature?.properties.g_no_lot) ??false;
              const parkingInventory = hasInventaire ? Math.max(
                props.inventaire.find((item)=> item.g_no_lot===feature?.properties?.g_no_lot && item.methode_estime===2)?.n_places_min ?? 0, 
                props.inventaire.find((item)=> item.g_no_lot===feature?.properties?.g_no_lot && item.methode_estime===1)?.n_places_mesure ?? 0, 
                props.inventaire.find((item)=> item.g_no_lot===feature?.properties?.g_no_lot && item.methode_estime===3)?.n_places_min ?? 0) 
                : 0;
              return {
                color: isLotInAnalyse ? 'green' : 'blue', // Border color based on condition
                weight: 2,     // Border thickness
                fillColor: props.optionCouleur!==-1?isLotInAnalyse ? 'pink' : hasInventaire?parkingInventory===0?'black':colorScale(Number(parkingInventory) || minValue).hex():'cyan':'cyan', // Fill color based on condition
                fillOpacity: 0.5,  // Fill transparency
              };
            },
            onEachFeature: (feature: any, layer: any) => {
              if (feature.properties) {
                layer.on({
                  click: handleLotClick
                });
              }
            }
          });

          if (!geoJsonLayerGroupRef.current) {
            geoJsonLayerGroupRef.current = L.layerGroup().addTo(map); // Create the layer group if it doesn't exist
          }

          geoJsonLayer.addTo(geoJsonLayerGroupRef.current); // Add the new layer to the group

          // Create a legend based on the color scale
          let legend:L.Control|null = null;
          function removeLegends(map:L.Map) {
            // Select all elements with the class 'info legend' and remove them
            const existingLegends = document.querySelectorAll('.info.legend');
            existingLegends.forEach(legend => {
                legend.remove();
            });
        }

          function addLegendToMap(map:L.Map, maxValue:number, minValue:number, colorScale:chroma.Scale) {
            // Remove existing legend if it exists
            removeLegends(map);
            // Create a new legend
            legend = new L.Control({ position: 'bottomright' });
        
            legend.onAdd = function () {
              const div = L.DomUtil.create('div', 'info legend');
              const grades = [0, 1, (maxValue + minValue) / 2, maxValue]; // Define breakpoints
              const labels = [];
              labels.push('N stat.');
              // Generate legend items based on color scale
              grades.forEach((grade, index) => {
                  const color = grade === 0 ? 'black' : colorScale(grade).hex();
                  labels.push(
                      `<i style="background:${color}"></i> ${Math.round(grade)}`
                  );
              });
      
              div.innerHTML = labels.join('<br>');
              return div;
            };
        
            // Add the new legend to the map
            legend.addTo(map);
          }
           
           // Call the function to add the legend
           if (props.optionCouleur!==-1){
            addLegendToMap(map, maxValue, minValue, colorScale);
          }
          // Check if inventaire has changed before adjusting bounds
          if (prevInventaireRef.current !== props.lotsDuQuartier) {
            const bounds = geoJsonLayer.getBounds();
            if (bounds.isValid()) {
              map.fitBounds(bounds);
            }
          }

          prevInventaireRef.current = props.lotsDuQuartier;

        }
      }
      }, [props.lotsDuQuartier, map]); // Dependency on props.geoJsondata and map

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
        <MapComponent />
      </>
      )}
    </MapContainer>
  </div>
  );
};

export default CarteInventaire;