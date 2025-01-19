import MenuBar from "../components/MenuBar";
import TableEnteteReglements from "../components/TableEnteteReglements";
import { useState , useEffect} from "react";
import { entete_reglement_stationnement } from "../types/DataTypes";
import { serviceReglements } from "../services";

const Reglements: React.FC = () => {
    const[entetes,defEntetes] = useState<entete_reglement_stationnement[]>([]);
    const[enteteSelect,defEntetesSelect] =useState<number>(-1);
    const [charge, defCharg] = useState<boolean>(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const resReglements = await serviceReglements.chercheTousEntetesReglements();
                console.log('Recu les périodes', resReglements);
                defEntetes(resReglements.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                defCharg(false);
            }
        };

        fetchData();
    }, []); // Empty dependency array means this runs once when the component mounts
    
    if (charge) {
        return <div>Chargement...</div>; // You can show a loading state while waiting for the data
    }  
      
    
    return(
        <div className="page-creation-reglements">
            <MenuBar/>
            <div className="conteneur-table-liste-entete">
                <TableEnteteReglements
                    entetes={entetes}
                    defEntetes={defEntetes}
                    enteteSelect={enteteSelect}
                    defEnteteSelect={defEntetesSelect}
                />
            </div>
            <div className="conteneur-table-details-reglements">

            </div>
        </div>
    )
}

export default Reglements;