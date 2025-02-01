import React from 'react';
import MenuBar from '../components/MenuBar';
import EnsRegTerrGantt from '../components/EnsRegTerrGantt';
import './ensregterr.css'

const EnsRegTerritoire: React.FC =()=>{
    return(
        <div className="page-ens-reg-terr">
            <MenuBar/>
            <div className="visu-ens-reg">
                <EnsRegTerrGantt/>
            </div>
        </div>
    )
}

export default EnsRegTerritoire;