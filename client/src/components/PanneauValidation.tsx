import { PropsPanneauValid } from "../types/InterfaceTypes"
import ListeLotsValidation from "./ListeLotsValidation";
import TableRevisionValidation from "./TableRevisionValidation";
const PanneauValidation:React.FC<PropsPanneauValid>=(props:PropsPanneauValid)=>{
    return(
        <div className='panneau-valid'>
            <ListeLotsValidation
                lots={props.lots}
                defLots={props.defLots}
                inventairePert={props.inventairePert}
                defInventairePert={props.defInventairePert}
                entreeValid={props.entreeValid}
                defEntreeValid={props.defEntreeValid}
                feuilleSelect={props.feuilleSelect}
            />
            <TableRevisionValidation
                inventairePert={props.inventairePert}
                defInventairePert={props.defInventairePert}
                entreeValid={props.entreeValid}
                defEntreeValid={props.defEntreeValid}
            />
        </div>
    )
}

export default PanneauValidation;