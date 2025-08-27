import React, { useState, useEffect } from 'react';
import { Link } from "react-router";
import { FournisseurContexte,utiliserContexte } from '../contexte/ContexteImmobilisation';
import { donneesCarteDeFond } from '../types/ContextTypes';
const MenuBar: React.FC<{}> = () => {

    const contexte = utiliserContexte();
    const optionCartoChoisie = contexte?.optionCartoChoisie ?? "";
    const changerCarto = contexte?.changerCarto ?? (() => {});
    const optionsCartos = contexte?.optionsCartos ?? [];

    return(
        <div className="menu-bar">
            <h1>Immobilisation</h1>
            <Link className="menu-links" to="/historique">Histoire</Link>
            <Link className="menu-links"to="/reg">Règlements</Link>
            <Link className="menu-links"to="/ens-reg">Ens. Règ</Link>
            <Link className="menu-links"to="/ens-reg-terr">Ens. Règ. Terr.</Link>
            <Link className="menu-links"to="/ana-reg">Analyse Règlements</Link>
            <Link className="menu-links"to="/ana-var">Analyse Variabilité</Link>
            <Link className="menu-links"to="/inventaire">Inventaire</Link>
            <Link className="menu-links"to="/ana-quartiers">Analyse Quartiers</Link>
            <div className="control-dds">
                <div className="ville-control">
                    <label 
                        htmlFor="ville-control-dd" 
                        className="label-ville-control">
                            Centre
                    </label>
                    <select className="ville-control-dd" id="select-quartier" name="select-quartier">
                        <option value="">Selection RMR</option>
                        <option value="1">Québec</option>
                        <option value="2">Montréal</option>
                    </select>
                </div>
                <div className="map-bground-control">
                    <label 
                        htmlFor="fond-de-carte" 
                        className="label-fond-de-carte">
                            Tuiles
                    </label>
                    <select id="fond-de-carte" name="fond-de-carte" value={optionCartoChoisie} onChange={(e)=>changerCarto(Number(e.target.value))}>
                        {optionsCartos.map((entree: donneesCarteDeFond) => <option value={entree.id}>{entree.description}</option>)}
                    </select>
                </div>
            </div>
        </div>
    )
}

export default MenuBar;