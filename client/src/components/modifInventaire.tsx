import React, { useState, useEffect,useCallback } from 'react';
import { calculateRegLotInventoryProps, TableRevueProps } from '../types/InterfaceTypes';
import { serviceInventaire } from '../services';
import { FeatureCollection, Geometry,Feature } from 'geojson';
import { ensemble_reglement_territoire, inventaire_stationnement,  reglement_complet } from '../types/DataTypes';
import TableauInventaireUnique from './TableauInventaireUnique';
import recalculeInventaireLot from '../utils/recalculeInventaireLot';
import ObtRegLots from '../utils/obtRegLots';
const CompoModifInventaire: React.FC<TableRevueProps> = (props:TableRevueProps) => {
    const emptyFeature: inventaire_stationnement = {
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
          id_inv:null
      };
    const [optionCalcul,defOptionCalcul] = useState<number>(-1);
    const [modifEnMarche,defModifEnMarche]= useState<boolean>(false);
    const [inventaireProp, defInventaireProp] = useState<inventaire_stationnement>(emptyFeature);
    const [newRegInvToProc,setNewRegInvToProc] = useState<boolean>(false);
    const [regPertinents,defRegPertinents] = useState<reglement_complet[]>([]);
    const [ensRegPertinents,defEnsRegPertinents] = useState<ensemble_reglement_territoire[]>([]);

    const renvoiInventaireReg = (): inventaire_stationnement => {
        const foundItem = props.inventaire.find(item => item.methode_estime === 2);
        return foundItem ?? emptyFeature;
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
                const ids = [...new Set (props.donneesRole.features.map(x => x.properties.id_provinc))]
                const partialRuleSets = ObtRegLots(ids)
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
    const gestEntreeManuelle = async (e:React.FormEvent<HTMLFormElement>): Promise<void> =>{
        console.log('a implementer')
        // Prevent the browser from reloading the page
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const inventaireASauvegarder = Number(formData.getAll("entree-manuelle-inventaire"));
        if (!isNaN(inventaireASauvegarder)) {
            //if (props.lots.)
            const FeatureASauvegarder: Partial<inventaire_stationnement>= {
                  g_no_lot: props.inventaire.find((o)=>o.methode_estime===1)?.g_no_lot,
                  n_places_min: 0,
                  n_places_max: 0,
                  n_places_mesure: inventaireASauvegarder,
                  n_places_estime: 0,
                  methode_estime: 1,
                  id_er: '',
                  id_reg_stat: '',
                  cubf: '',
                  commentaire: 'Relevé manuel',
                  id_inv:props.inventaire.find((o)=>o.methode_estime===1)?.id_inv
            };

            console.log("La valeur convertie est :", inventaireASauvegarder);
            
        } else {
            console.error("La conversion a échoué : la valeur n'est pas un nombre.");
        }
        console.log(`a implementer${formData.getAll("entree-manuelle-inventaire")}`)
    }

    const gestSauvegardeNvInv=async()=>{
        const id_modif = renvoiInventaireReg().id_inv;
        const reussi = await serviceInventaire.modifieInventaire(id_modif,inventaireProp);
        console.log(`Mise à jour réussie ?: ${reussi}`)
        if (reussi){
            setNewRegInvToProc(false);
            defInventaireProp(emptyFeature);
            defModifEnMarche(false);
            alert('Calcul sauvegardé');
        } else{
            alert('Sauvegarde échouée');
        }
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
                    <button onClick={gestSauvegardeNvInv}>Écraser ancien inventaire</button>
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
        console.log('Calcul complet, mise en page')
    }

    const renderForm = () => {
        switch (optionCalcul) {
            case 0:
                return (
                    <>
                        <form onSubmit={gestEntreeManuelle}>
                            <label>
                                Nombre de places pour ce lot <input name="entree-manuelle-inventaire" defaultValue="0" />
                            </label>
                            <button type="submit">Sauvegarder</button>
                        </form>
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