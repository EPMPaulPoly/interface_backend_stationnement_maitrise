import { PropsPanneauValid } from "../types/InterfaceTypes"
import ListeLotsValidation from "./ListeLotsValidation";
const PanneauValidation:React.FC<PropsPanneauValid>=(props:PropsPanneauValid)=>{
    return(
        <div className='panneau-valid'>
            <ListeLotsValidation
                lots={props.lots}
                defLots={props.defLots}
            />
        </div>
    )
}

export default PanneauValidation;