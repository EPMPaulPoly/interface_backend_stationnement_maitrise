import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { CarteInventaireProps } from '../types/InterfaceTypes';
import "leaflet/dist/leaflet.css";
import L, { LeafletEvent } from 'leaflet';
import selectLotInventaire from '../utils/selectLotInventaire';
import { selectLotProps } from '../types/utilTypes';
import {  lotCadastralAvecBoolInvGeoJsonProperties } from '../types/DataTypes';
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
          const geoJsonLayer = L.geoJSON(lotsAMontrer, {
            style: (feature) => {
              const isLotInAnalyse = feature && props.lotSelect.features.some(lot => lot.properties.g_no_lot === feature.properties.g_no_lot);
              return {
                color: isLotInAnalyse ? 'red' : 'blue', // Border color based on condition
                weight: 2,     // Border thickness
                fillColor: isLotInAnalyse ? 'pink' : 'cyan', // Fill color based on condition
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