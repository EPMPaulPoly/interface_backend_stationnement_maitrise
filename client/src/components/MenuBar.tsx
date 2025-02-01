import React, { useState, useEffect } from 'react';
import { Link } from "react-router";

const MenuBar: React.FC<{}> = () => {
    const gestFondDeCarte=()=>{
        console.log("Fond de carte non-implémenté")
    }

    return(
        <div className="menu-bar">
            <h1>Interface Stationnement</h1>
            <Link className="menu-links" to="/historique">Histoire</Link>
            <Link className="menu-links"to="/reg">Règlements</Link>
            <Link className="menu-links"to="/ens-reg">Ens. Règ</Link>
            <Link className="menu-links"to="/ens-reg-terr">Ens. Règ. Terr.</Link>
            <Link className="menu-links"to="/comp-reg">Comp. Règ</Link>
            <Link className="menu-links"to="/inventaire">Inventaire</Link>
            <Link className="menu-links"to="/comp-quartiers">Comp. Quartiers</Link>
            <div className="ville-control">
                    <select className="ville-control-dd" id="select-quartier" name="select-quartier">
                        <option value="">Selection RMR</option>
                        <option value="1">Québec</option>
                        <option value="2">Montréal</option>
                    </select>
                    <label 
                        htmlFor="fond-de-carte" 
                        className="label-fond-de-carte">
                            Fond de carte</label>
                    <select id="fond-de-carte" name="fond-de-carte" onChange={gestFondDeCarte}>
                        <option>OSM</option>
                        <option>Géodésie Québec</option>
                    </select>
                </div>
        </div>
    )
}

export default MenuBar;