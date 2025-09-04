import { useEffect, useRef } from "react";
import { PropsCartoValidation } from "../types/InterfaceTypes"
import {  MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { utiliserContexte } from "../contexte/ContexteImmobilisation";


const CarteValidation: React.FC<PropsCartoValidation> = (props: PropsCartoValidation) => {
    const contexte = utiliserContexte();
    const optionCartoChoisie = contexte?.optionCartoChoisie ?? "";
    const changerCarto = contexte?.changerCarto ?? (() => { });
    const optionsCartos = contexte?.optionsCartos ?? [];

    const urlCarto = optionsCartos.find((entree) => entree.id === optionCartoChoisie)?.URL ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    const attributionCarto = optionsCartos.find((entree) => entree.id === optionCartoChoisie)?.attribution ?? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    const zoomCarto = optionsCartos.find((entree) => entree.id === optionCartoChoisie)?.zoomMax ?? 18
    console.log('Map received  zone data:', JSON.stringify(props.lotSelect, null, 0));
    const geoJsonLayerGroupRef = useRef<L.LayerGroup | null>(null); // Refe

    const MapComponent = () => {
        const map = useMap(); // Access the map instance

        useEffect(() => {
            if (map) {
                if (geoJsonLayerGroupRef.current) {
                    geoJsonLayerGroupRef.current.clearLayers(); // Clear previous vector layers
                }

                if (props.lotSelect && props.lotSelect.features.length > 0) {
                    // Create a new GeoJSON layer from props.geoJsondata
                    const geoJsonLayer = L.geoJSON(props.lotSelect, {
                        style: {
                            color: 'red', // Border color
                            weight: 2,     // Border thickness
                            fillColor: 'cyan', // Fill color
                            fillOpacity: 0,  // Fill transparency
                        },
                        onEachFeature: (feature: any, layer: any) => {
                            if (feature.properties) {
                                const { g_no_lot, g_va_suprf } = feature.properties; // Destructure properties
                                const formattedPopupContent = `
                            <strong>Feature ID:</strong> ${g_no_lot} <br/>
                            <strong>Superficie Terrain:</strong> ${g_va_suprf} <br/>
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
        }, [props.lotSelect, map]); // Dependency on props.geoJsondata and map

        return null; // No need to render anything for the map component itself
    };

    return (<div className='carte-validation'>
        <MapContainer
            center={props.startPosition}
            zoom={props.startZoom}
            style={{ height: '100%', width: '100%' }}
            minZoom={1}
            maxZoom={zoomCarto}
        >
            <TileLayer
                url={urlCarto}
                attribution={attributionCarto}
                maxZoom={zoomCarto}
                minZoom={1}
            />
            {props.lotSelect && (<>
                {props.lotSelect.features?.map((feature, index) => {
                    console.log(`Feature ${index + 1}:`, feature);
                    return null; // We return null because we're only logging, not rendering anything here.
                })}
                <MapComponent />
            </>
            )}
        </MapContainer>
    </div>)
}
export default CarteValidation;