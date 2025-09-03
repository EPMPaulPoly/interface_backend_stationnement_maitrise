import { ArrowBack, Settings } from "@mui/icons-material";
import { ControlValStatProps } from "../types/InterfaceTypes";
import { Button } from "@mui/material";
import { width } from "@mui/system";
import serviceValidation from "../services/serviceValidation";



const ControlValStat : React.FC<ControlValStatProps>=(props:ControlValStatProps)=>{
    const regenereInputs=async()=>{
        if (props.calculEnCours===false){
            props.defCalculEnCours(true)
            await serviceValidation.regenereInputs()
            props.defCalculEnCours(false)
        }
    }
    return(<div className='validation-menu'>
        {props.definitionStrate===false ?
            <>
                <Settings
                    className="menu-icon-valid"
                    onClick={()=>props.defDefinitionStrate(!props.definitionStrate)}
                />
            </>
            :
            <>
                <ArrowBack
                    className="menu-icon-valid"
                    onClick={()=>props.defDefinitionStrate(!props.definitionStrate)}
                />
                <Button variant="outlined"  
                onClick={regenereInputs}
                sx={{
                    ml: 2,
                    color: 'white',
                    borderColor: 'white',
                    borderWidth:'2px',
                    '&:hover': {
                        backgroundColor: '#222',
                        borderColor: 'white',
                    },
                }}>
                    Regénérer table entrée stratification
                </Button>
            </>
        }
    </div>)
}

export default ControlValStat