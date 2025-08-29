import { Add } from "@mui/icons-material";
import { Strate } from "../types/DataTypes";
import { PropsArbreStrates } from "../types/InterfaceTypes"
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import React, { useEffect } from 'react';
import serviceValidation from "../services/serviceValidation";

const ArbreStrates: React.FC<PropsArbreStrates> = (props: PropsArbreStrates) => {

    

    const selectStrate = (nodeId: string) => {
        if (nodeId.substring(0,3)==='add'){
            console.log('entering creation of new strata')
        }else{
            console.log('entering selection of existing strata')
            const selected = findStrateById(props.strates, Number(nodeId));
            if (selected) props.defStrateAct(selected)
        }
    }

    const findStrateById = (tree: Strate[], id: number): Strate | null => {
        for (let node of tree) {
            if (node.id_strate === id) return node;
            if (node.subStrata) {
                const found = findStrateById(node.subStrata, id);
                if (found) return found;
            }
        }
        return null;
    };



    const renderTree = (strateTree: Strate[],parentId:number|null): React.ReactNode => (
        <>
            {strateTree.map((row) => (
                <TreeItem
                    key={row.id_strate}
                    itemId={String(row.id_strate)}
                    label={row.nom_strate}
                >
                    {/* render children if they exist */}
                    {row.subStrata && row.subStrata.length > 0
                        ? renderTree(row.subStrata,row.id_strate)
                        : null}
                </TreeItem>
            ))}

            {/* Global Add at root level */}
            {parentId===null?<TreeItem
                key="add-top"
                itemId="add-top"
                label={
                    <span
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            color: "#4caf50",
                        }}
                    >
                        <Add fontSize="small" /> Ajouter
                    </span>
                }
            />:<TreeItem
                key={`add-${parentId}`}
                itemId={`add-${parentId}`}
                label={
                    <span
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            color: "#4caf50",
                        }}
                    >
                        <Add fontSize="small" /> Ajouter
                    </span>
                }
            />}
        </>
    );

    return (
        <div className='tree-sample'>
            <SimpleTreeView
                onItemClick={(event, nodeId) => {selectStrate(nodeId)}}
            >
                {renderTree(props.strates,null)}
            </SimpleTreeView>
        </div>
    )
}

export default ArbreStrates;