import React, { useState, useEffect,useCallback } from 'react';
import { calculateRegLotInventoryProps, TableRevueProps } from '../types/InterfaceTypes';
import { serviceInventaire } from '../services';
import { FeatureCollection, Geometry,Feature } from 'geojson';
import { ensemble_reglement_territoire, inventaireGeoJSONProps, reglement_complet } from '../types/DataTypes';
import TableauInventaireUnique from './TableauInventaireUnique';
import recalculeInventaireLot from '../utils/recalculeInventaireLot';
const CompoModifInventaire: React.FC<TableRevueProps> = (props) => {
    const emptyFeature: Feature<Geometry | null, inventaireGeoJSONProps> = {
        type: "Feature",
        geometry: null,
        properties: {
          g_no_lot: '',
          n_places_min: 0,
          n_places_max: 0,
          n_places_mesure: 0,
          n_places_estime: 0,
          methode_estime: 0,
          id_er: '',
          id_reg_stat: '',
          cubf: '',
          commentaire: '',
        },
      };
    const [optionCalcul,defOptionCalcul] = useState<number>(-1);
    const [modifEnMarche,defModifEnMarche]= useState<boolean>(false);
    const [inventaireProp, defInventaireProp] = useState<Feature<Geometry|null, inventaireGeoJSONProps>>(emptyFeature);
    const [newRegInvToProc,setNewRegInvToProc] = useState<boolean>(false);
    const [regPertinents,defRegPertinents] = useState<reglement_complet[]>([]);
    const [ensRegPertinents,defEnsRegPertinents] = useState<ensemble_reglement_territoire[]>([]);
    const defaultValue = { properties: { methode_estime: 0 } } as Feature<Geometry, inventaireGeoJSONProps>;

    const renvoiInventaireReg = (): Feature<Geometry, inventaireGeoJSONProps> => {
        const foundItem = props.inventaire.features.find(item => item.properties.methode_estime === 2);
        return foundItem ?? defaultValue;
    }
    const gestAnnulModifs = () =>{
        defModifEnMarche(false)
        setNewRegInvToProc(false)
        defInventaireProp(emptyFeature)
    }

    const gestAnnulPanneau = () =>{
        defModifEnMarche(false)
        setNewRegInvToProc(false)
        defInventaireProp(emptyFeature)
        props.defPanneauModifVisible(false)
    }
    const gestDemarrerCalcul = () =>{
        if (!modifEnMarche){
            defModifEnMarche(true)
            if (optionCalcul===2){

            }
        } else {
            defModifEnMarche(false)
        }
        
    }
    const gestMethodeCalcul =(e: React.ChangeEvent<HTMLSelectElement>)=>{
        const valeur = Number(e.target.value); // Convertit en nombre
        console.log("Méthode choisie:", valeur);
        defOptionCalcul(valeur); // Met à jour l'état
    }
    const gestEntreeManuelle =() =>{
        console.log('a implementer')
    }

    const renduInventaireApprobation = ()=>{
        if (newRegInvToProc){
            return(
                <div className="compare-inventaire">
                    <div className="compare-side-by-side">
                        <div className="compare-inventaire-old">
                            <p>Ancien</p>
                            <TableauInventaireUnique
                                inventaire={renvoiInventaireReg()}
                            />
                        </div>
                        <div className="compare-inventaire-new">
                            <p>Nouveau</p>
                            <TableauInventaireUnique
                                inventaire={inventaireProp}
                            />
                        </div>
                    </div>
                    <button>Écraser ancien inventaire</button>
                </div>
                
            )
        } else{
            return(<></>)
        }
    }

    const gestCalculLotInvReg = ()=>{
        const propsCalcul:calculateRegLotInventoryProps = {
            lots:props.inventaire,
            modifEnMarche:modifEnMarche,
            defInventaireProp:defInventaireProp,
            defNvInvRegATrait:setNewRegInvToProc
        }
        recalculeInventaireLot(propsCalcul)
    }

    const renderForm = () => {
        switch (optionCalcul) {
            case 0:
                return (
                    <>
                        <p>Entrez le nombre de places pour ce lot.</p><input type="text" />
                        <button onClick={gestEntreeManuelle}>Ajouter Entrée Inventaire</button>
                    </>
                );
            case 1:
                return (
                    <>
                        <p>Le calcul règlementaire automatique à partir du rôle sera lancé.</p>
                        <button onClick={gestCalculLotInvReg}>Lancer le calcul</button>
                        {renduInventaireApprobation()}
                    </>
                );
            case 2:
                return (
                    <>
                        <p>Vous pouvez ajuster les valeurs avant validation.</p>
                        
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="compo-modif-inventaire">
            <div className="controle-modif-inventaire-lot">
            <button onClick={gestAnnulPanneau}>Annuler Modifs</button>
            <select onChange={gestMethodeCalcul} value={optionCalcul} disabled={modifEnMarche}>
                <option value={-1} disabled>Choisissez une option</option>
                <option value={0}>Entrée Manuelle</option>
                <option value={1}>Calcul Règlementaire Automatique</option>
                <option value={2}>Calcul Règlementaire Valeurs Manuelles</option>
            </select>
            <button onClick={gestDemarrerCalcul}>{!modifEnMarche? 'Démarrer option choisie':'Annuler'}</button>
            </div>
            <div className="panneau-modif-inventaire-lot">
            {modifEnMarche && (
            <div className="options-dynamiques">
                {renderForm()}
            </div>
        )}
            </div>
        </div>
    )
}

export default CompoModifInventaire;