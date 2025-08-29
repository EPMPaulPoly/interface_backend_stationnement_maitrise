import { FormControl, FormLabel, Input, InputLabel, MenuItem, Select, TextField, } from "@mui/material"
import { PropsModifStrate } from "../types/InterfaceTypes"
import ArbreStrates from "./arbreStrates"
import { Edit, Save } from "@mui/icons-material"
import { useState } from "react"
import Cancel from "@mui/icons-material/Cancel"

const ModifStrates: React.FC<PropsModifStrate> = (props: PropsModifStrate) => {
    const [modif, defModif] = useState<boolean>(false)

    const handleItemChange = (field: string, value: string) => {

    }

    const turnOnEditing = () => {
        defModif(true)
    }
    const turnOffEditing = () => {
        defModif(false)
    }
    return (
        <div className="modif-strate">
            {!modif ? <Edit sx={{ paddingBottom: "8px" }} onClick={turnOnEditing} /> : (<><Save /><Cancel onClick={turnOffEditing} /></>)}
            <FormControl variant="standard" fullWidth sx={{ gap: 2 }}>
                <FormLabel sx={{ color: "white" }}>Informations de base</FormLabel>

                {["nom_strate", "nom_table", "nom_colonne"].map((field) => (
                    <TextField
                        key={field}
                        label={field.replace("_", " ").toUpperCase()}
                        value={(props.strateAct as any)[field]}
                        disabled={!modif}
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
                        disabled={!modif}
                        onChange={(e) => handleItemChange("condition", String(e.target.value))}
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
                {props.strateAct.condition.condition_type==="range"?
                <>{["condition_min","condition_max"].map((field)=>
                    <TextField
                        key={field}
                        label={field.replace("_", " ").toUpperCase()}
                        value={(props.strateAct.condition as any)[field]}
                        disabled={!modif}
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
                }</>:<>
                    <TextField
                        key={props.strateAct.condition.condition_valeur}
                        label={"Valeur exacte"}
                        value={props.strateAct.condition.condition_valeur}
                        disabled={!modif}
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
            </FormControl>
        </div>

    )
}

export default ModifStrates