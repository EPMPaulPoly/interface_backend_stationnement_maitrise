import React, { useState, useEffect } from 'react';
import { TableRevueProps } from '../types/InterfaceTypes';

const CompoModifInventaire: React.FC<TableRevueProps> = (props) => {
    const [optionCalcul,defOptionCalcul] = useState<number>(-1);
    const [modifEnMarche,defModifEnMarche]= useState<boolean>(false);
    const gestAnnulModifs = () =>{
        props.defModifEnCours(false)
    }
    const gestDemarrerCalcul = () =>{
        if (!modifEnMarche){
            defModifEnMarche(true)
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
    const gestCalculAutomatique =() =>{
        console.log('a implementer')
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
                        <p>Le calcul règlementaire automatique sera effectué.</p>
                        <button onClick={gestCalculAutomatique}>Lancer le calcul</button>
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
            <button onClick={gestAnnulModifs}>Annuler Modifs</button>
            <select onChange={gestMethodeCalcul} value={optionCalcul} disabled={modifEnMarche}>
                <option value={-1} disabled>Choisissez une option</option>
                <option value={0}>Entrée Manuelle</option>
                <option value={1}>Calcul Règlementaire Automatique</option>
                <option value={2}>Calcul Règlementaire Valeurs Manuelles</option>
            </select>
            <button onClick={gestDemarrerCalcul}>{!modifEnMarche ? 'Démarrer option choisie':'Annuler'}</button>
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