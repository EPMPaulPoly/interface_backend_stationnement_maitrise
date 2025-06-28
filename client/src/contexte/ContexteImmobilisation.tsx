import { createContext, useState, ReactNode, Dispatch, SetStateAction, useContext } from 'react';
import { ContexteImmobilisationType, donneesCarteDeFond, FournisseurContexteProps } from '../types/ContextTypes';


const ContexteImmobilisation = createContext<ContexteImmobilisationType | undefined>(undefined);



const FournisseurContexte = ({ children }: FournisseurContexteProps) => {
    const cartoPossibles: donneesCarteDeFond[] = [
        {
            id: 0,
            description: 'OSM',
            URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            zoomMax:19
        },
        {
            id: 1,
            description: 'Géodésie Québec',
            URL: 'https://geoegl.msp.gouv.qc.ca/carto/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=orthos&STYLE=default&TILEMATRIXSET=EPSG_3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png',
            attribution: '&copy; Géodésie Québec',
            zoomMax:19
        },
        {
            id: 2,
            description: 'ESRI',
            URL: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
            zoomMax:19
        }
    ];
    const [optionsCartos, defOptionsCarto] = useState<donneesCarteDeFond[]>(cartoPossibles);
    const [optionCartoChoisie, defOptionCartoChoisie] = useState<number>(0);

    const changerCarto = (idAUtiliser: number) => {
        defOptionCartoChoisie(idAUtiliser)
    }

    return (
        <ContexteImmobilisation.Provider value={{ optionCartoChoisie, changerCarto, optionsCartos }}>
            {children}
        </ContexteImmobilisation.Provider>
    );
};
const utiliserContexte = () => {
    return useContext(ContexteImmobilisation)
};


export { FournisseurContexte, utiliserContexte };