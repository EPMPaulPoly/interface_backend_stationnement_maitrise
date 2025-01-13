import {LatLng} from "leaflet";
import { SetStateAction } from "react";

export interface study_area{
    name: string;
    x: number;
    y: number;
    zoom: number;
}

export interface load_state{
    state: boolean,
    set_load_state: SetStateAction<boolean>,
}

export interface error_state{
    state:boolean,
    set_error_state: SetStateAction<boolean>
}

export interface Utilisateur{
    name:string|null,
    hash:string|null,
    role:1|2|undefined
}

export interface role_set_state{
    state:boolean,
    set_role_set_state:SetStateAction<boolean>
}
