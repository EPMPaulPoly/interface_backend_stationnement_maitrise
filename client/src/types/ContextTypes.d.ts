export interface donneesCarteDeFond{
    id:number,
    description:string,
    URL:string,
    attribution:string;
    zoomMax:number
}

export type ContexteImmobilisationType = {
    optionCartoChoisie: number;
    changerCarto: (idAUtiliser: number) => void;
    optionsCartos: donneesCarteDeFond[]
};

export type FournisseurContexteProps = {
    children: ReactNode;
};