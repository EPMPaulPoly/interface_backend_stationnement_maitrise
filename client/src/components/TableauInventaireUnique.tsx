import { TableauInventaireUniqueProps } from "../types/InterfaceTypes";
const TableauInventaireUnique: React.FC<TableauInventaireUniqueProps> =(props:TableauInventaireUniqueProps) =>{
    return(
        <>
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Valeur</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>No Lot</td>
                        <td>{props.inventaire.properties.g_no_lot}</td>
                    </tr>
                    <tr>
                        <td>Methode estime</td>
                        <td>{props.inventaire.properties?.methode_estime}</td>
                    </tr>
                    <tr>
                        <td>N place min</td>
                        <td>{props.inventaire.properties?.n_places_min}</td>
                    </tr>
                    <tr>
                        <td>N place max</td>
                        <td>{props.inventaire.properties?.n_places_max}</td>
                    </tr>
                    <tr>
                        <td>N place comptees</td>
                        <td>{props.inventaire.properties?.n_places_mesure}</td>
                    </tr>
                    <tr>
                        <td>N place estimee</td>
                        <td>{props.inventaire.properties?.n_places_estime}</td>
                    </tr>
                    <tr>
                        <td>Commentaire</td>
                        <td>{props.inventaire.properties?.commentaire}</td>
                    </tr>
                    <tr>
                        <td>ID inv</td>
                        <td>{props.inventaire.properties?.id_inv}</td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}

export default TableauInventaireUnique;