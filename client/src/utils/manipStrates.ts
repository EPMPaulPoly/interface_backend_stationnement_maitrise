import { SetStateAction,Dispatch } from "react";
import { Strate } from "../types/DataTypes";
import { strataManipProps } from "../types/utilTypes";

const manipStrates = {
    findStrateById: (tree: Strate[], id: number): Strate | null => {
        for (let node of tree) {
            if (node.id_strate === id) return node;
            if (node.subStrata) {
                const found = manipStrates.findStrateById(node.subStrata, id);
                if (found) return found;
            }
        }
        return null;
    },
    retournerProchainOrdre: (id_parent: number | null, strates: Strate[]): number => {
        if (id_parent === null) {
            return Math.max(...strates.map((row) => row.index_ordre)) + 1;
        } else {
            const relStrate = manipStrates.findStrateById(strates, id_parent);
            const ordreMax =
                (relStrate !== null && relStrate.subStrata && relStrate.subStrata.length > 0) ?
                    Math.max(...relStrate.subStrata.map((row) => row.index_ordre)) + 1
                    : 0;
            console.log('relstrate ', relStrate)
            console.log('ordremax ', ordreMax)
            return ordreMax
        }
    },
    ajoutStrate: (id_parent: string, props:strataManipProps) => {
        const id_parent_num = id_parent.slice(4) === 'top' ? null : Number(id_parent.slice(4))
        const old_strates=structuredClone(props.strates)
        const old_strate=structuredClone(props.strateAct) 
        const prochainOrdreIndex = manipStrates.retournerProchainOrdre(id_parent_num, props.strates);
        const newStrate: Strate = {
            id_strate: -1,
            nom_strate: '',
            nom_colonne: '',
            nom_table: '',
            id_enfants: null,
            est_racine: id_parent_num === null ? true : false,
            index_ordre: prochainOrdreIndex,
            condition: {
                condition_type: 'equals',
                condition_valeur: 0
            }
        }
        const newStrates = manipStrates.ajouteFeuilleArbre(id_parent_num, props.strates, newStrate)
        props.defAnciennesStrates(old_strates)
        props.defAncienneStrateAct(old_strate)
        console.log('test')
        props.defStrates(newStrates)
        props.defStrate(newStrate)
        props.defModif(true)
        console.log("entrée dans la création d'un item")
    },
    ajouteFeuilleArbre: (id_parent: number | null, strates: Strate[], nouvelleStrate: Strate): Strate[] => {
        let stratesAMod: Strate[] = []
        if (id_parent === null) {
            stratesAMod = [...strates]
            stratesAMod.push(nouvelleStrate)
        } else {
            for (let node of strates) {
                if (node.id_strate !== id_parent) {
                    stratesAMod.push(node)
                } else if (node.id_strate === id_parent && node.subStrata !== undefined) {
                    let newSubstrate = node.subStrata
                    newSubstrate.push(nouvelleStrate)
                    let newnode = { ...node, subStrata: newSubstrate }
                    stratesAMod.push(newnode)
                } else if (node.id_strate === id_parent && node.subStrata === undefined) {
                    let newsubStrate = [nouvelleStrate]
                    let newnode = { ...node, subStrata: newsubStrate }
                    stratesAMod.push(newnode)
                }
            }
        }
        return stratesAMod
    },
    modifStrateAct:(
        champ:string,
        valeur:string,
        StrateAct:Strate,
        Strates:Strate[],
        defStrateAct:Dispatch<SetStateAction<Strate>>,
        defStrates:Dispatch<SetStateAction<Strate[]>>):void =>
    {
        let strateAModif:Strate={...StrateAct};
        if ( ['nom_strate','nom_table','nom_colonne'].includes(champ)){
            strateAModif = {...StrateAct,[champ]:valeur};
            
        }
        if (['condition_min','condition_max','condition_valeur'].includes(champ)){
            strateAModif= {
                ...StrateAct,
                condition:{
                    ...StrateAct.condition,
                    [champ]:Number(valeur)
                }
            }
        }
        if (['condition_type'].includes(champ)){
            strateAModif= {
                ...StrateAct,
                condition:{
                    ...StrateAct.condition,
                    [champ]:valeur
                }
            }
        }
        const stratesOut = manipStrates.modifieItemArbre(strateAModif,Strates) 
        //console.log('Strate a modif : ',strateAModif )
        //console.log('Strates a modif: ',stratesOut)
        defStrateAct(strateAModif)
        defStrates(stratesOut)
    },
    modifieItemArbre:(
        strateModif:Strate,
        stratesInit:Strate[],
    ):Strate[]=>{
        let stratesOut:Strate[]=[];
        for (let node of stratesInit){
            if(node.id_strate===strateModif.id_strate){
                stratesOut.push(strateModif)
            }else {
                let node_out:Strate;
                if (node.subStrata!==undefined){
                    node_out = {
                        ...node,
                        subStrata:manipStrates.modifieItemArbre(strateModif,node.subStrata)
                    }
                } else{
                    node_out = {
                        ...node
                    }
                }
                 
                stratesOut.push(node_out)
            }
        }
        return stratesOut
    }
    
}

export default manipStrates