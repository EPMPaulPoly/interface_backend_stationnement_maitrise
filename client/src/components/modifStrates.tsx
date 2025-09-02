import { FormControl, FormLabel, Input, InputLabel, MenuItem, Select, TextField, } from "@mui/material"
import { PropsModifStrate } from "../types/InterfaceTypes"
import ArbreStrates from "./arbreStrates"
import { Delete, Edit, Save } from "@mui/icons-material"
import { useState } from "react"
import Cancel from "@mui/icons-material/Cancel"
import manipStrates from "../utils/manipStrates"
import serviceValidation from "../services/serviceValidation"
import { Strate } from "../types/DataTypes"
import { ReponseStrateValide } from "../types/serviceTypes"

const ModifStrates: React.FC<PropsModifStrate> = (props: PropsModifStrate) => {
    const handleItemChange = (field: string, value: string) => {
        manipStrates.modifStrateAct(field, value, props.strateAct, props.strates, props.defStrateAct, props.defStrates)
    }

    const turnOnEditing = () => {
        props.defModif(true)
    }
    const saveEdits = async () => {
        props.defModif(false)
        let data: ReponseStrateValide
        if (props.strateAct.id_strate !== -1) {
            data = await serviceValidation.modifieStrate(props.strateAct.id_strate, props.strateAct)
        } else {
            if (props.idParent !== null) {
                data = await serviceValidation.nouvelleStrate(props.strateAct, props.idParent)
            } else {
                data = await serviceValidation.nouvelleStrate(props.strateAct, null)
            }
        }
        props.defIdParent(null)
        props.defStrates(data.data)
    }

    const gestSupprime=async(id_strate:number)=>{
            if (id_strate!==-1){
                const resultat = await serviceValidation.supprimeStrate(id_strate)
                props.defStrates(resultat.data)
                props.defStrateAct(resultat.data[0])
            } else{
                props.defStrates(props.anciennesStrates)
                props.defStrateAct(props.ancienneStrateAct)
                props.defAncienneStrateAct({
                    id_strate:-1,
                    nom_colonne:'',
                    nom_table:'',
                    nom_strate:'',
                    ids_enfants:[],
                    est_racine:true,
                    index_ordre:0,
                    condition:{
                        condition_type:'equals',
                        condition_valeur:0
                    }
                })
                props.defAnciennesStrates([])
            }
        }
    const cancelEditing = () => {
        props.defStrateAct(props.ancienneStrateAct)
        props.defStrates(props.anciennesStrates)
        props.defAncienneStrateAct({ id_strate: 0, nom_strate: '', nom_colonne: '', nom_table: '', index_ordre: 0, est_racine: false, ids_enfants: null, condition: { condition_type: 'equals', condition_valeur: 0 } })
        props.defAnciennesStrates([])
        props.defModif(false)
    }
    return (
        <div className="modif-strate">
            {!props.modif ? (<div className='strate-edit-del'><Edit sx={{ paddingBottom: "8px" }} onClick={turnOnEditing} /><Delete onClick={()=>gestSupprime(props.strateAct.id_strate)}/></div>) : (<div className='strate-save-cancel'><Save onClick={saveEdits} /><Cancel onClick={cancelEditing} /></div>)}
            <FormControl variant="standard" fullWidth sx={{ gap: 2 }}>
                <FormLabel sx={{ color: "white" }}>Informations de base</FormLabel>

                {["nom_strate", "nom_table", "nom_colonne"].map((field) => (
                    <TextField
                        key={field}
                        label={field.replace("_", " ").toUpperCase()}
                        value={(props.strateAct as any)[field]}
                        disabled={!props.modif}
                        onChange={(e) => handleItemChange(field, e.target.value)}
                        variant="standard"
                        sx={{
                            "& .MuiInputBase-input": {
                                color: "white",
                                backgroundColor: "#1f1f1f",
                            },
                            "& .MuiInputLabel-root": { color: "white" },
                            "& .MuiInputLabel-root.Mui-disabled": {
                                color: "#cccccc",
                                WebkitTextFillColor: "#cccccc",
                            },
                            "& .MuiInputBase-input.Mui-disabled": {
                                color: "#cccccc",
                                WebkitTextFillColor: "#cccccc",
                                opacity: 1,
                            },
                            "& .MuiInput-underline:before": { borderBottomColor: "white" },
                            "& .MuiInput-underline:hover:before": { borderBottomColor: "#ffcc00" },
                        }}
                    />
                ))}

                {/* Floating Select */}
                <FormControl variant="standard" fullWidth>
                    <InputLabel
                        id="strate-select-label"
                        sx={{
                            color: "#cccccc",
                            "&.Mui-disabled": { color: "#cccccc", WebkitTextFillColor: "#cccccc" },
                        }}
                    >
                        Type de valeur
                    </InputLabel>
                    <Select
                        labelId="strate-select-label"
                        value={props.strateAct.condition.condition_type}
                        disabled={!props.modif}
                        onChange={(e) => handleItemChange("condition_type", String(e.target.value))}
                        sx={{
                            "& .MuiSelect-select": { color: "white", backgroundColor: "#1f1f1f" },
                            "& .MuiSelect-select.Mui-disabled": {
                                color: "#cccccc",
                                WebkitTextFillColor: "#cccccc",
                                opacity: 1,
                            },
                            "& .MuiInput-underline:before": { borderBottomColor: "white" },
                            "& .MuiInput-underline:hover:before": { borderBottomColor: "#ffcc00" },
                        }}
                    >
                        <MenuItem value={"equals"}>Valeur exacte</MenuItem>
                        <MenuItem value={"range"}>Étendue</MenuItem>
                    </Select>
                </FormControl>
                {props.strateAct.condition.condition_type === "range" ?
                    <>{["condition_min", "condition_max"].map((field) =>
                        <TextField
                            key={field}
                            label={field.replace("_", " ").toUpperCase()}
                            value={(props.strateAct.condition as any)[field]}
                            disabled={!props.modif}
                            onChange={(e) => handleItemChange(field, e.target.value)}
                            variant="standard"
                            sx={{
                                "& .MuiInputBase-input": {
                                    color: "white",
                                    backgroundColor: "#1f1f1f",
                                },
                                "& .MuiInputLabel-root": { color: "white" },
                                "& .MuiInputLabel-root.Mui-disabled": {
                                    color: "#cccccc",
                                    WebkitTextFillColor: "#cccccc",
                                },
                                "& .MuiInputBase-input.Mui-disabled": {
                                    color: "#cccccc",
                                    WebkitTextFillColor: "#cccccc",
                                    opacity: 1,
                                },
                                "& .MuiInput-underline:before": { borderBottomColor: "white" },
                                "& .MuiInput-underline:hover:before": { borderBottomColor: "#ffcc00" },
                            }}
                        />
                    )
                    }</> : <>
                        <TextField
                            key={props.strateAct.condition.condition_valeur}
                            label={"Valeur exacte"}
                            value={props.strateAct.condition.condition_valeur}
                            disabled={!props.modif}
                            onChange={(e) => handleItemChange("condition_valeur", e.target.value)}
                            variant="standard"
                            sx={{
                                "& .MuiInputBase-input": {
                                    color: "white",
                                    backgroundColor: "#1f1f1f",
                                },
                                "& .MuiInputLabel-root": { color: "white" },
                                "& .MuiInputLabel-root.Mui-disabled": {
                                    color: "#cccccc",
                                    WebkitTextFillColor: "#cccccc",
                                },
                                "& .MuiInputBase-input.Mui-disabled": {
                                    color: "#cccccc",
                                    WebkitTextFillColor: "#cccccc",
                                    opacity: 1,
                                },
                                "& .MuiInput-underline:before": { borderBottomColor: "white" },
                                "& .MuiInput-underline:hover:before": { borderBottomColor: "#ffcc00" },
                            }}
                        />
                    </>
                }
                {props.strateAct.subStrata === undefined ?
                <TextField
                    key={'n_sample'}
                    label={'Taille Échantillon'}
                    value={props.strateAct.n_sample??0}
                    disabled={!props.modif}
                    onChange={(e) => handleItemChange('n_sample', e.target.value)}
                    variant="standard"
                    sx={{
                        "& .MuiInputBase-input": {
                            color: "white",
                            backgroundColor: "#1f1f1f",
                        },
                        "& .MuiInputLabel-root": { color: "white" },
                        "& .MuiInputLabel-root.Mui-disabled": {
                            color: "#cccccc",
                            WebkitTextFillColor: "#cccccc",
                        },
                        "& .MuiInputBase-input.Mui-disabled": {
                            color: "#cccccc",
                            WebkitTextFillColor: "#cccccc",
                            opacity: 1,
                        },
                        "& .MuiInput-underline:before": { borderBottomColor: "white" },
                        "& .MuiInput-underline:hover:before": { borderBottomColor: "#ffcc00" },
                    }}
                />:<></>}
                
            </FormControl>
        </div>

    )
}

export default ModifStrates