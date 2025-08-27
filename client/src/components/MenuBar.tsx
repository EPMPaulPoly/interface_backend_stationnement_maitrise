import React, { useState, useEffect } from 'react';
import { Link } from "react-router";
import { FournisseurContexte,utiliserContexte } from '../contexte/ContexteImmobilisation';
import { donneesCarteDeFond } from '../types/ContextTypes';
import SubMenuComponent from './SubMenuComponent';
const MenuBar: React.FC<{}> = () => {

    const contexte = utiliserContexte();
    const optionCartoChoisie = contexte?.optionCartoChoisie ?? "";
    const changerCarto = contexte?.changerCarto ?? (() => {});
    const optionsCartos = contexte?.optionsCartos ?? [];

    return(
        <div className="menu-bar">
            <h1>Immobilisation</h1>
            <SubMenuComponent
                label={"Entrée Règlementation"}
                options={[
                    {label:"Historique",path:"/historique"},
                    {label:"Règlements",path:"/reg"},
                    {label:"Ensembles de règlements",path:"/ens-reg"},
                    {label:"Ensembles de règlements territoires",path:"/ens-reg-terr"}]}
            />
            <SubMenuComponent
                label={"Inventaire"}
                options={[
                    {label:"Manipulation Inventaire", path:"/inventaire"},
                    {label:"Validation Statistique", path:"/valid-stat"}
                ]}
            />
            <SubMenuComponent
                label={"Pages d'analyse"}
                options={[
                    {label:"Visualisation Ensembles de règlements",path:"/ana-reg"},
                    {label:"Analyse de variabilité",path:"/ana-var"},
                    {label:"Analyse agrégée quartiers",path:"/ana-quartiers"}
                ]}
            />
            
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