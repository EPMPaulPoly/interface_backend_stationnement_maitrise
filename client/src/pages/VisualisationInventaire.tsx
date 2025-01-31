import MenuBar from '../components/MenuBar';
import {useState,useEffect, useRef} from 'react';
import L, { LatLngExpression } from 'leaflet';
import TableInventaire from '../components/TableInventaire';
import { ensemble_reglements_stationnement, entete_ensembles_reglement_stationnement, inventaire_stationnement, quartiers_analyse, reglement_complet } from '../types/DataTypes';
import { serviceQuartiersAnalyse, } from '../services/serviceQuartiersAnalyse';
import {serviceInventaire} from '../services/serviceInventaire';
import { FeatureCollection,Geometry } from 'geojson';
import { inventaireGeoJSONProps,lotCadastralGeoJsonProperties,roleFoncierGeoJsonProps } from '../types/DataTypes';
import CarteInventaire from '../components/carteInventaire';
import TableRevueInventaire from '../components/RevueInventaire';
import './inventaire.css';
import './common.css';

const position: LatLngExpression = [45.5017, -73.5673]; // Montreal coordinates

const VisualisationInventaire: React.FC = () => {
    const[positionDepart,defPositionDepart] = useState<LatLngExpression>([46.85,-71]);// position depart
    const[zoomDepart,defZoomDepart] = useState<number>(10); // zoom depart
    const [quartier,defQuartierAnalyse] = useState<number>(-1); // quartier d'analyse pour aller chercher l'inventaire
    const [optionsQuartier,defOptionsQuartiers] = useState<quartiers_analyse[]>([]);//quartiers selectionnable
    const [roleARegarder,defRoleARegarder] = useState<string>('');
    const [regARegarder,defRegARegarder] = useState<number>(-1);
    const [ensRegARegarder,defEnsRegARegarder] = useState<number>(-1);
    const [methodeEstimeARegarder,defMethodeEstimeARegarder] = useState<number>(-1);
    const [inventaire,defInventaire] = useState<FeatureCollection<Geometry,inventaireGeoJSONProps>>({//inventaire
        type: "FeatureCollection",
        features: []
    });
    const [itemSelect,defItemSelect] = useState<FeatureCollection<Geometry,inventaireGeoJSONProps>>({//inventaire
        type: "FeatureCollection",
        features: []
    });
    const [lotSelect,defLotSelect] = useState<FeatureCollection<Geometry,lotCadastralGeoJsonProperties>>({//lot selectionné
        type: "FeatureCollection",
        features: []
    });
    const [roleSelect,defRoleSelect] = useState<FeatureCollection<Geometry,roleFoncierGeoJsonProps>>({//items du role
        type: "FeatureCollection",
        features: []
    });
    const [regSelect,defRegSelect] = useState<reglement_complet[]>([]);// reglement complet
    const [ensRegSelect,defEnsRegSelect] = useState<ensemble_reglements_stationnement[]>([]);// ensembles de reglement complet
    // Va chercher les quartiers pertinents
    useEffect(() => {
        const fetchData = async () => {
            const quartiers = await serviceQuartiersAnalyse.chercheTousQuartiersAnalyse();
            defOptionsQuartiers(quartiers.data);
        };
        fetchData();
    }, []);
    // Gestion de selection de quartier
    const gestSelectQuartier = async (quartier_selectionne:number) =>{
        defQuartierAnalyse(quartier_selectionne)
        const inventaire = await serviceInventaire.obtientInventaireParQuartier(quartier_selectionne)
        if (inventaire.success){
            defInventaire(inventaire.data)
            const center = new L.GeoJSON(inventaire.data).getBounds().getCenter();
            defPositionDepart(center);
            defZoomDepart(12);
        }
    }

    const gestFondDeCarte=()=>{
        console.log("Fond de carte non-implémenté")
    }

    const gestChoro=()=>{
        console.log("Couleur pas encore gérée")
    }

    return (
        <div className="page-inventaire">
            <MenuBar/>
            <div className="table-inventaire-control">
                <label htmlFor="select-quartier">Sélection Quartier</label>
                <select id="select-quartier" name="select-quartier" onChange={e => gestSelectQuartier(Number(e.target.value))}>
                    <option value="">Selection quartier</option>
                    {optionsQuartier.map(quartier=>(
                        <option key={quartier.id_quartier} value={quartier.id_quartier} >
                            {quartier.nom_quartier}
                        </option>
                    ))}
                </select>
                <label 
                    htmlFor="show-all-lots" 
                    className="label-show-all-lots">
                        Montrer Tous Lots</label>
                <input 
                    type="checkbox" 
                    id="show-all-lots"/>
                <label 
                    htmlFor="fond-de-carte" 
                    className="label-fond-de-carte">
                        Fond de carte</label>
                <select id="fond-de-carte" name="fond-de-carte" onChange={gestFondDeCarte}>
                    <option>OSM</option>
                    <option>Géodésie Québec</option>
                </select>
                <label 
                    htmlFor="valeur-choroplethe" 
                    className="label-valeur-choroplethe">
                        Échelle Couleur</label>
                <select 
                    id="valeur-choroplethe" 
                    name="valeur-choroplethe" 
                    onChange={gestChoro}>
                    <option>Aucun</option>
                    <option>places/superf terrain</option>
                    <option>places</option>
                </select>
            </div>
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
                    lots={lotSelect}
                    defLots={defLotSelect}
                    donneesRole={roleSelect}
                    defDonneesRole={defRoleSelect}
                    ensemblesReglements={ensRegSelect}
                    defEnsemblesReglements={defEnsRegSelect}
                    reglements={regSelect}
                    defReglements={defRegSelect}
                    roleRegard={roleARegarder}
                    defRoleRegard={defRoleARegarder}
                    methodeEstimeRegard={methodeEstimeARegarder}
                    defMethodeEstimeRegard={defMethodeEstimeARegarder}
                    regRegard={regARegarder}
                    defRegRegard={defRegARegarder}
                    ensRegRegard={ensRegARegarder}
                    defEnsRegRegard={defEnsRegARegarder}
                />
                <div className="barre-details-inventaire">
                <TableRevueInventaire
                    lots={lotSelect}
                    defLots={defLotSelect}
                    donneesRole={roleSelect}
                    defDonneesRole={defRoleSelect}
                    reglements={regSelect}
                    defReglements={defRegSelect}
                    ensemblesReglements={ensRegSelect}
                    defEnsemblesReglements={defEnsRegSelect}
                    inventaire={itemSelect}
                    defInventaire={defItemSelect}
                    roleRegard={roleARegarder}
                    defRoleRegard={defRoleARegarder}
                    methodeEstimeRegard={methodeEstimeARegarder}
                    defMethodeEstimeRegard={defMethodeEstimeARegarder}
                    regRegard={regARegarder}
                    defRegRegard={defRegARegarder}
                    ensRegRegard={ensRegARegarder}
                    defEnsRegRegard={defEnsRegARegarder}
                />
                </div>

            </div>
            <TableInventaire
                quartier={quartier}
                defQuartier={defQuartierAnalyse}
                optionsQuartiers={optionsQuartier}
                defOptionsQuartiers={defOptionsQuartiers}
                inventaire={inventaire}
                defInventaire={defInventaire} 
                lots={lotSelect}
                defLots={defLotSelect}
                donneesRole={roleSelect}
                defDonneesRole={defRoleSelect}
                ensemblesReglements={ensRegSelect}
                defEnsemblesReglements={defEnsRegSelect}
                reglements={regSelect}
                defReglements={defRegSelect}
                itemSelect={itemSelect}
                defItemSelect={defItemSelect}
                roleRegard={roleARegarder}
                defRoleRegard={defRoleARegarder}
                methodeEstimeRegard={methodeEstimeARegarder}
                defMethodeEstimeRegard={defMethodeEstimeARegarder}
                regRegard={regARegarder}
                defRegRegard={defRegARegarder}
                ensRegRegard={ensRegARegarder}
                defEnsRegRegard={defEnsRegARegarder}
            />
        </div>

    );
};

export default VisualisationInventaire;