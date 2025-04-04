import { MenuCompQuartiersProps } from "../types/InterfaceTypes";

const MenuCompQuartiers:React.FC<MenuCompQuartiersProps>=(props:MenuCompQuartiersProps)=>{
    const gestSelectMethodeAnalyse=(idTypeAnalyse:number)=>{
        props.defMethodeAnalyse(idTypeAnalyse)
    }
    const gestSelectPrioriteEstime=(idPriorite:number)=>{
        props.defPrioriteInventaire(idPriorite)
    }
    return(
        <div className="menu-comp-quartiers">
            <label htmlFor="select-type">Type d'analyse</label>
            <select id="select-type" name="select-type" onChange={e => gestSelectMethodeAnalyse(Number(e.target.value))} value={props.methodeAnalyse}>
                <option value={-1}>Selection méthode</option>
                {props.methodesPossibles.map(methode=>(
                    <option key={methode.idAnalyse} value={methode.idAnalyse} >
                        {methode.descriptionAnalyse}
                    </option>
                ))}
            </select>
            <label htmlFor="select-inventory-priority">Sélectionner la priorité des estimés</label>
            <select id="select-type" name="select-type" onChange={e => gestSelectPrioriteEstime(Number(e.target.value))} value={props.prioriteInventaire}>
                {props.prioriteInventairePossibles.map(priorite=>(
                    <option key={priorite.idPriorite} value={priorite.idPriorite} >
                        {priorite.descriptionPriorite}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default MenuCompQuartiers;