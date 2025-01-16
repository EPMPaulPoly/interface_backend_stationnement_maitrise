import React, { useState, useEffect } from 'react';
import { Link } from "react-router";

const MenuBar: React.FC<{}> = () => {
    return(
        <div className="menu-bar">
            <h1>Interface Stationnement</h1>
            <Link to="/historique">Histoire</Link>
            <Link to="/reg">Règlements</Link>
            <Link to="/ens-reg">Ens. Règ</Link>
            <Link to="/comp-reg">Comp. Règ</Link>
            <Link to="/inventaire">Inventaire</Link>
            <Link to="/comp-quartiers">Comp. Quartiers</Link>
        </div>
    )
}

export default MenuBar;