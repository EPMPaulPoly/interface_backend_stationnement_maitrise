import { PropsInterfaceStrates } from "../types/InterfaceTypes"
import ArbreStrates from "./arbreStrates"
import ModifStrates from "./modifStrates"

const DefinitionStratesEchantionnage:React.FC<PropsInterfaceStrates>=(props:PropsInterfaceStrates)=>{
    return(
        <div className='onglet-definition-strates'>
            <ArbreStrates
                strates={props.strates}
                defStrates={props.defStrates}
                defStrateAct={props.defStrateActuelle}
            />
            <ModifStrates
                strateAct={props.strateActuelle}
                defStrateAct={props.defStrateActuelle}
            />
        </div>
    )
}

export default DefinitionStratesEchantionnage  ;