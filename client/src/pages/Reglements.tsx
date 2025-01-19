import MenuBar from "../components/MenuBar";
import TableEnteteReglements from "../components/TableEnteteReglements";
import { useState , useEffect} from "react";
import { entete_reglement_stationnement } from "../types/DataTypes";


const Reglements: React.FC = () => {
    const[entetes,defEntetes] = useState<entete_reglement_stationnement[]>([]);
    const[enteteSelect,defEntetesSelect] =useState<number>(-1);
    const [charge, defCharg] = useState<boolean>(true);
    
      
    
    return(
        <div className="page-creation-reglements">
            <MenuBar/>
            <div className="conteneur-table-liste-entete">
                <TableEnteteReglements
                    entetes={entetes}
                    defEntetes={defEntetes}
                    enteteSelect={enteteSelect}
                    defEnteteSelect={defEntetesSelect}
                    charge={charge}
                    defCharge={defCharg}
                />
            </div>
            <div className="conteneur-table-details-reglements">

            </div>
        </div>
    )
}

export default Reglements;