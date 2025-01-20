import React, { useState, useEffect } from 'react';
import { Link } from "react-router";
import '../App.css'

const MenuBar: React.FC<{}> = () => {
    return(
        <div className="menu-bar">
            <h1>Interface Stationnement</h1>
            <Link className="menu-links" to="/historique">Histoire</Link>
            <Link className="menu-links"to="/reg">Règlements</Link>
            <Link className="menu-links"to="/ens-reg">Ens. Règ</Link>
            <Link className="menu-links"to="/comp-reg">Comp. Règ</Link>
            <Link className="menu-links"to="/inventaire">Inventaire</Link>
            <Link className="menu-links"to="/comp-quartiers">Comp. Quartiers</Link>
            <div className="ville-control">
                    <select className="ville-control-dd" id="select-quartier" name="select-quartier">
                        <option value="">Selection RMR</option>
                        <option value="1">Québec</option>
                        <option value="2">Montréal</option>
                    </select>
                </div>
        </div>
    )
}

export default MenuBar;