import { ArrowBack, Settings } from "@mui/icons-material";
import { ControlValStatProps } from "../types/InterfaceTypes";
import { Button } from "@mui/material";
import { width } from "@mui/system";



const ControlValStat : React.FC<ControlValStatProps>=(props:ControlValStatProps)=>{
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
                <Button variant="outlined"  sx={{
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