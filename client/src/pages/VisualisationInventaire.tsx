import MenuBar from '../components/MenuBar';
import {useState,useEffect, useRef} from 'react';
import L, { LatLngExpression } from 'leaflet';
import TableInventaire from '../components/TableInventaire';
import { ensemble_reglements_stationnement, entete_ensembles_reglement_stationnement, inventaire_stationnement, quartiers_analyse, reglement_complet } from '../types/DataTypes';
import { serviceQuartiersAnalyse, } from '../services/serviceQuartiersAnalyse';
import {serviceInventaire} from '../services/serviceInventaire';
import { FeatureCollection,Geometry } from 'geojson';
import { lotCadastralGeoJsonProperties,roleFoncierGeoJsonProps,lotCadastralAvecBoolInvGeoJsonProperties } from '../types/DataTypes';
import CarteInventaire from '../components/carteInventaire';
import TableRevueInventaire from '../components/RevueInventaire';
import './inventaire.css';
import './common.css';
import CompoModifInventaire from '../components/modifInventaire';
import ComparaisonInventaireQuartier from '../components/ComparaisonInventaireQuartier';
import MenuInventaire from '../components/MenuInventaire';

const position: LatLngExpression = [45.5017, -73.5673]; // Montreal coordinates

const VisualisationInventaire: React.FC = () => {
    const[chargement,defChargement] = useState<boolean>(false); // Chargement
    const[positionDepart,defPositionDepart] = useState<LatLngExpression>([46.85,-71]);// position depart
    const[zoomDepart,defZoomDepart] = useState<number>(10); // zoom depart
    const [quartier,defQuartierAnalyse] = useState<number>(-1); // quartier d'analyse pour aller chercher l'inventaire
    const [optionsQuartier,defOptionsQuartiers] = useState<quartiers_analyse[]>([]);//quartiers selectionnable
    const [roleARegarder,defRoleARegarder] = useState<string>('');//état pour l'entrée du rôle à regarder dans le panneau de détails
    const [regARegarder,defRegARegarder] = useState<number>(-1);// état pour le règlement à regarder dans le panneau de détails
    const [ensRegARegarder,defEnsRegARegarder] = useState<number>(-1); // état pour l'ensemble de règlement à regarder dans le peannu de téail
    const [methodeEstimeARegarder,defMethodeEstimeARegarder] = useState<number>(-1); // État pour aller rechercher un type d'estimé
    const [lotsDuQuartier,defLotsDuQuartier] = useState<FeatureCollection<Geometry,lotCadastralAvecBoolInvGeoJsonProperties>>({
        type:"FeatureCollection",
        features:[]
    })
    const [inventaire,defInventaire] = useState<inventaire_stationnement[]>([]);
    const [inventaireSelect,defInventaireSelect] = useState<inventaire_stationnement[]>([]);

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
    const [panneauModifVisible,defPanneauModifVisible] = useState<boolean>(false);// Binaire pour afficher le panneau permettant de créer un inventaire sur un lot particulier
    const [panneauComparInventaireQuartierVis,defPanneauComparInventaireQuartierVis] = useState<boolean>(false);// binaire pour montrer le panneau de comparaison 
    const [nouvelInventaireQuartier,defNouvelInventaireQuartier] = useState<inventaire_stationnement[]>([]);
    const [montrerTousLots,defMontrerTousLots] = useState<boolean>(false);
    const [optionCouleur,defOptionCouleur] = useState<number>(-1);
    // Va chercher les quartiers pertinents
    useEffect(() => {
        const fetchData = async () => {
            const quartiers = await serviceQuartiersAnalyse.chercheTousQuartiersAnalyse();
            defOptionsQuartiers(quartiers.data);
        };
        fetchData();
    }, []);
   
    return (
        <div className="page-inventaire">
            <MenuBar/>
            <MenuInventaire
                lotsDuQuartier={lotsDuQuartier}
                defLotsDuQuartier={defLotsDuQuartier}
                inventaireActuel={inventaire}
                defInventaireActuel={defInventaire}
                nouvelInventaireReg={nouvelInventaireQuartier}
                defNouvelInventaireReg={defNouvelInventaireQuartier}
                positionDepart={positionDepart}
                defPositionDepart={defPositionDepart}
                zoomDepart={zoomDepart}
                defZoomDepart={defZoomDepart}
                optionsQuartier={optionsQuartier}
                defNouvelInventaireQuartier={defNouvelInventaireQuartier}
                defPanneauComparInventaireQuartierVis={defPanneauComparInventaireQuartierVis}
                quartier={quartier}
                defQuartier={defQuartierAnalyse}
                chargement={chargement}
                defChargement={defChargement}
                montrerTousLots={montrerTousLots}
                defMontrerTousLots={defMontrerTousLots}
            />
            <div className="panneau-haut">
                {panneauComparInventaireQuartierVis?
                (<>
                    <ComparaisonInventaireQuartier
                        ancienInventaireReg={inventaire}
                        defAncienInventaireReg={defInventaire}
                        nouvelInventaireReg={nouvelInventaireQuartier}
                        defNouvelInventaireReg={defNouvelInventaireQuartier}
                        validationInventaireQuartier={panneauComparInventaireQuartierVis}
                        defValidationInventaireQuartier={defPanneauComparInventaireQuartierVis}
                        chargement={chargement}
                        defChargement={defChargement}
                    />
                </>)
                :(panneauModifVisible ? 
                (<>
                <CarteInventaire
                    lotsDuQuartier={lotsDuQuartier}
                    defLotsDuQuartiers={defLotsDuQuartier}
                    startPosition={positionDepart}
                    setStartPosition={defPositionDepart}
                    startZoom={zoomDepart}
                    setStartZoom={defZoomDepart}
                    inventaire={inventaire}
                    defInventaire={defInventaire}
                    itemSelect={inventaireSelect}
                    defItemSelect={defInventaireSelect}
                    lotSelect={lotSelect}
                    defLotSelect={defLotSelect}
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
                    montrerTousLots={montrerTousLots}
                />
                <CompoModifInventaire
                    lots={lotSelect}
                    defLots={defLotSelect}
                    donneesRole={roleSelect}
                    defDonneesRole={defRoleSelect}
                    reglements={regSelect}
                    defReglements={defRegSelect}
                    ensemblesReglements={ensRegSelect}
                    defEnsemblesReglements={defEnsRegSelect}
                    inventaire={inventaireSelect}
                    defInventaire={defInventaireSelect}
                    roleRegard={roleARegarder}
                    defRoleRegard={defRoleARegarder}
                    methodeEstimeRegard={methodeEstimeARegarder}
                    defMethodeEstimeRegard={defMethodeEstimeARegarder}
                    regRegard={regARegarder}
                    defRegRegard={defRegARegarder}
                    ensRegRegard={ensRegARegarder}
                    defEnsRegRegard={defEnsRegARegarder}
                    panneauModifVisible={panneauModifVisible}
                    defPanneauModifVisible={defPanneauModifVisible}
                    quartier_select={quartier}
                    defInventaireQuartier={defInventaire}
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
                    inventaire={inventaireSelect}
                    defInventaire={defInventaireSelect}
                    roleRegard={roleARegarder}
                    defRoleRegard={defRoleARegarder}
                    methodeEstimeRegard={methodeEstimeARegarder}
                    defMethodeEstimeRegard={defMethodeEstimeARegarder}
                    regRegard={regARegarder}
                    defRegRegard={defRegARegarder}
                    ensRegRegard={ensRegARegarder}
                    defEnsRegRegard={defEnsRegARegarder}
                    panneauModifVisible={panneauModifVisible}
                    defPanneauModifVisible={defPanneauModifVisible}
                    quartier_select={quartier}
                    defInventaireQuartier={defInventaire}
                />
                </div></>)
                : (<><CarteInventaire
                    lotsDuQuartier={lotsDuQuartier}
                    defLotsDuQuartiers={defLotsDuQuartier}
                    startPosition={positionDepart}
                    setStartPosition={defPositionDepart}
                    startZoom={zoomDepart}
                    setStartZoom={defZoomDepart}
                    inventaire={inventaire}
                    defInventaire={defInventaire}
                    itemSelect={inventaireSelect}
                    defItemSelect={defInventaireSelect}
                    lotSelect={lotSelect}
                    defLotSelect={defLotSelect}
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
                    montrerTousLots={montrerTousLots}
            /><div className="barre-details-inventaire">
            <TableRevueInventaire
                lots={lotSelect}
                defLots={defLotSelect}
                donneesRole={roleSelect}
                defDonneesRole={defRoleSelect}
                reglements={regSelect}
                defReglements={defRegSelect}
                ensemblesReglements={ensRegSelect}
                defEnsemblesReglements={defEnsRegSelect}
                inventaire={inventaireSelect}
                defInventaire={defInventaireSelect}
                roleRegard={roleARegarder}
                defRoleRegard={defRoleARegarder}
                methodeEstimeRegard={methodeEstimeARegarder}
                defMethodeEstimeRegard={defMethodeEstimeARegarder}
                regRegard={regARegarder}
                defRegRegard={defRegARegarder}
                ensRegRegard={ensRegARegarder}
                defEnsRegRegard={defEnsRegARegarder}
                panneauModifVisible={panneauModifVisible}
                defPanneauModifVisible={defPanneauModifVisible}
                quartier_select={quartier}
                defInventaireQuartier={defInventaire}
            />
            </div></>)
            )}
            </div>
            {panneauComparInventaireQuartierVis ?
            <></>
            :<TableInventaire
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
                itemSelect={inventaireSelect}
                defItemSelect={defInventaireSelect}
                roleRegard={roleARegarder}
                defRoleRegard={defRoleARegarder}
                methodeEstimeRegard={methodeEstimeARegarder}
                defMethodeEstimeRegard={defMethodeEstimeARegarder}
                regRegard={regARegarder}
                defRegRegard={defRegARegarder}
                ensRegRegard={ensRegARegarder}
                defEnsRegRegard={defEnsRegARegarder}
                lotsDuQuartier={lotsDuQuartier}
            />}
            
        </div>

    );
};

export default VisualisationInventaire;