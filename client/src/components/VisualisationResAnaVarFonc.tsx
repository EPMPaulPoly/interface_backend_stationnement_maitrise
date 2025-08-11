import { Settings } from "@mui/icons-material"
import { PropsVisualisationAnaVarFonc } from "../types/InterfaceTypes"

const VisualisationResAnaVarFonc:React.FC<PropsVisualisationAnaVarFonc>=(props: PropsVisualisationAnaVarFonc)=>{
    return(
        <div className="pan-visualisation-resultats">
            <Settings
                onClick={() => props.defEditionParams(true)}
            />
            {props.ensRegAAnalyser.length>0?
                <div className="pan-vis-resultats-graph">

                </div>
                :<>
                </>
            }
            
        </div>
    )
}

export default VisualisationResAnaVarFonc