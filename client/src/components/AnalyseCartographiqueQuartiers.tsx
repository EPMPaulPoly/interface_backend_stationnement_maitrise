import React from 'react';
import { AnalyseCartoQuartierProps } from "../types/InterfaceTypes";
import { GeoJSONPropsAnaQuartier, TypesAnalysesCartographiqueQuartier } from '../types/AnalysisTypes';
import { useState,useEffect,useRef } from 'react';
import { serviceAnalyseInventaire } from '../services/serviceAnalyseInventaire';
import { Feature, FeatureCollection,Geometry } from 'geojson';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import L, { LeafletEvent,LatLngExpression } from 'leaflet';
import chroma from 'chroma-js';
const AnalyseCartographiqueQuartiers:React.FC<AnalyseCartoQuartierProps>=(props:AnalyseCartoQuartierProps)=>{
    const [typeCarto,defTypeCarto] = useState<number>(-1);
    const [cartoAMontrer,defCartoAMontrer] = useState<FeatureCollection<Geometry,GeoJSONPropsAnaQuartier>>({
            type: "FeatureCollection",
            features: []
        });
    const [cartoValid,defCartoValide] = useState<boolean>(false);
    const [chargement,defChargement] = useState<boolean>(false);
    const[positionDepart,defPositionDepart] = useState<LatLngExpression>([46.85,-71]);
    const[zoomDepart,defZoomDepart] = useState<number>(10);
    const gestSelectMethodeAnalyse=(idTypeAnalyse:number)=>{
        defTypeCarto(idTypeAnalyse)
    }
    const options:TypesAnalysesCartographiqueQuartier[]=[
        {
            idAnalyseCarto: 0,
            descriptionAnalyseCarto: "Stationnement total",
        },
        {
            idAnalyseCarto: 1,
            descriptionAnalyseCarto: "Stationnement par superficie",
        },
        {
            idAnalyseCarto:2,
            descriptionAnalyseCarto: "Stationnement par voiture"
        },
        {
            idAnalyseCarto:3,
            descriptionAnalyseCarto: "Stationnement par habitant"
        },
        {
            idAnalyseCarto:4,
            descriptionAnalyseCarto: "Pourcentage Territoire"
        }
    ];
    const geoJsonLayerGroupRef = useRef<L.LayerGroup | null>(null); // Refe
    const prevInventaireRef = useRef<GeoJSON.FeatureCollection<GeoJSON.Geometry, GeoJSONPropsAnaQuartier> | null>(null);
    const MapComponent = () => {
        const map = useMap(); // Access the map instance

            useEffect(() => {
                if (map) {
                    if (geoJsonLayerGroupRef.current) {
                        geoJsonLayerGroupRef.current.clearLayers(); // Clear previous vector layers
                    }
                    
                    if (cartoAMontrer && cartoAMontrer.features.length > 0) {
                        // Create a new GeoJSON layer from props.geoJsondata
                        const lotsAMontrer = cartoAMontrer;
                        // Extract min/max dynamically from the dataset
                        const values = lotsAMontrer.features.map(f => f.properties.valeur);
                        const minValue = Math.min(...values);
                        const maxValue = Math.max(...values);

                        // Create a color scale from light yellow to dark red
                        const colorScale = chroma.scale(['#FFEDA0', '#E31A1C', '#800026']).domain([minValue, maxValue]);
                        console.log('échelle')
                        const geoJsonLayer = L.geoJSON(lotsAMontrer, {
                            style: (feature) => {
                                if (!feature || !feature.properties) {return {color: 'blue',
                                    weight: 2,
                                    fillColor: 'cyan',
                                    fillOpacity: 0.5,}; // Ensure feature exists
                                } else{
                                    return {
                                        color: 'blue',
                                        weight: 2,
                                        fillColor: colorScale(Number(feature.properties.valeur) || minValue).hex(),
                                        fillOpacity: 0.5,
                                    };
                                }
                            },
                            onEachFeature: (feature: any, layer: any) => {
                                if (feature.properties) {
                                    const value = feature.properties.valeur ?? 'No data';
                                    const description = feature.properties.description ?? 'No data'
                                    layer.bindPopup(`<b>${description}</b> ${value}`);
                                }
                            }
                        });

                        //if (!geoJsonLayerGroupRef.current) {
                            geoJsonLayerGroupRef.current = L.layerGroup().addTo(map); // Create the layer group if it doesn't exist
                        //}

                        geoJsonLayer.addTo(geoJsonLayerGroupRef.current); // Add the new layer to the group
                        
                        // Create a legend based on the color scale
                        const legend = new L.Control({ position: 'bottomright' });

                        legend.onAdd = function () {
                            const div = L.DomUtil.create('div', 'info legend');
                            const grades = [minValue, (maxValue + minValue) / 2, maxValue]; // Define breakpoints
                            const labels:string[] = [];

                            // Generate legend items based on color scale
                            grades.forEach((grade, index) => {
                                const color = colorScale(grade).hex();
                                labels.push(
                                    `<i style="background:${color}"></i> ${Math.round(grade)}`
                                );
                            });

                            div.innerHTML = labels.join('<br>');
                            return div;
                        };

                        // Add legend to the map
                        legend.addTo(map);

                        // Check if inventaire has changed before adjusting bounds
                        if (prevInventaireRef.current !== cartoAMontrer) {
                            const bounds = geoJsonLayer.getBounds();
                            if (bounds.isValid()) {
                                map.fitBounds(bounds);
                            }
                        }
                    prevInventaireRef.current = cartoAMontrer;
                }
                }
            }, [cartoAMontrer, map]); // Dependency on props.geoJsondata and map

            return null; // No need to render anything for the map component itself
    };
    const gestSelectionCarto = async() =>{
        let CartoRep;
        defCartoValide(false)
        defChargement(true)
        switch (typeCarto) {
            case 0:
                CartoRep = await serviceAnalyseInventaire.obtientInventaireAgregeParQuartier(props.prioriteInventairePossibles.find((ordre)=> ordre.idPriorite=== props.prioriteInventaire)?.listeMethodesOrdonnees??[1,3,2])
                break;
            case 1:
                CartoRep = await serviceAnalyseInventaire.obtientInventaireAgregeParQuartierParSuperf(props.prioriteInventairePossibles.find((ordre)=> ordre.idPriorite=== props.prioriteInventaire)?.listeMethodesOrdonnees??[1,3,2])
                break;
            case 2:
                console.log('Pas encore implémenté quartier par voiture ')
                break;
            case 3:
                console.log('Pas encore implémenté quartier par habitant')
                break;
            case 4:
                CartoRep = await serviceAnalyseInventaire.obtientInventaireAgregeParQuartierPourcentTerritoire(props.prioriteInventairePossibles.find((ordre)=> ordre.idPriorite=== props.prioriteInventaire)?.listeMethodesOrdonnees??[1,3,2])
                break;
            default:
                CartoRep = {success:false,data:{
                    type: "FeatureCollection",
                    features: []
                } as FeatureCollection<Geometry,GeoJSONPropsAnaQuartier>}; 
        }
        if (CartoRep && CartoRep.success){
            defCartoValide(true)
            defChargement(false)
            defCartoAMontrer(CartoRep.data)
        } else{
            defChargement(false)
            defCartoValide(false)
            defCartoAMontrer({
                type: "FeatureCollection",
                features: []
            })
        }


    }
    const renduCartographie = ()=>{
        if ((chargement)){
            return(<p>Chargement en cours - Chill le grand</p>)
        } else if(cartoValid && !chargement){
            return(<div className="carte-quartiers">
                <MapContainer
                  center={positionDepart}
                  zoom={zoomDepart}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {cartoValid && (<>
                    <MapComponent />
                  </>
                  )}
                </MapContainer>
              </div>
              );
        }
    }
 
    return(<>
        <div className="menu-selection-couleur">
            <label htmlFor="select-map-color">Type d'analyse cartographique</label>
            <select id="select-map-color" name="select-type" onChange={e => gestSelectMethodeAnalyse(Number(e.target.value))} value={typeCarto}>
                <option value={-1}>Selection carto</option>
                {options.map(methode=>(
                    <option key={methode.idAnalyseCarto} value={methode.idAnalyseCarto} >
                        {methode.descriptionAnalyseCarto}
                    </option>
                ))}
            </select>
            {typeCarto!==-1?<button onClick={gestSelectionCarto}>Obtenir Carte</button>:<></>}
        </div>
        {renduCartographie()}
        </>
    )
}

export default AnalyseCartographiqueQuartiers;
