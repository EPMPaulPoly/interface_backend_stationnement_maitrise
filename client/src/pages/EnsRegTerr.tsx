import React,{useState,useEffect} from 'react';
import MenuBar from '../components/MenuBar';
import EnsRegTerrGantt from '../components/EnsRegTerrGantt';
import './ensregterr.css'
import { entete_ensembles_reglement_stationnement, periode,territoire, territoireGeoJsonProperties } from '../types/DataTypes';
import GeoJSON,{FeatureCollection,Geometry} from 'geojson';
import ControlEnsRegTerr from '../components/ControlEnsRegTerr';
import { serviceHistorique } from '../services';

const EnsRegTerritoire: React.FC =()=>{
    const [periodesDispo,defPeriodesDispo] = useState<periode[]>([]);
    const [periodeSelect,defPeriodeSelect] = useState<periode>(
        {
            id_periode:-1,
            nom_periode:'NA',
            date_debut_periode:NaN,
            date_fin_periode:NaN
        }
    );
    const [territoireDispo,defTerritoireDispo] = useState<GeoJSON.FeatureCollection<GeoJSON.Geometry,territoireGeoJsonProperties>>({
        type:"FeatureCollection",
        features:[]
    });
    const [territoireSelect,defTerritoireSelect] = useState<FeatureCollection<Geometry,territoireGeoJsonProperties>>(
        {
            type:'FeatureCollection',
            features:[]
        }
    )
    const [ensRegDispo,defEnsRegDispo] = useState<entete_ensembles_reglement_stationnement[]>([]);
    const [annees,defAnnees] = useState<number[]>([]);
    useEffect(() => {
        const fetchData = async () => {
            const periode = await serviceHistorique.obtientTous();
            defPeriodesDispo(periode.data);
        };
        fetchData();
    }, []);
    return(
        <div className="page-ens-reg-terr">
            <MenuBar/>
            <div className="control-visu-ens-reg">
                <ControlEnsRegTerr
                    ensRegDispo={ensRegDispo}
                    defEnsRegDispo={defEnsRegDispo}
                    territoireSelect={territoireSelect}
                    defTerritoireSelect={defTerritoireSelect}
                    periodeSelect={periodeSelect}
                    defPeriodeSelect={defPeriodeSelect}
                    periodesDispo={periodesDispo}
                    defPeriodesDispo={defPeriodesDispo}
                    territoiresDispo={territoireDispo}
                    defTerritoireDispo={defTerritoireDispo}
                    defAnneesVisu={defAnnees}
                    anneesVisu={annees}
                />
            </div>
                <EnsRegTerrGantt
                    ensRegDispo={ensRegDispo}
                    defEnsRegDispo={defEnsRegDispo}
                    periodeSelect={periodeSelect}
                    defPeriodeSelect={defPeriodeSelect}
                />
        </div>
    )
}

export default EnsRegTerritoire;