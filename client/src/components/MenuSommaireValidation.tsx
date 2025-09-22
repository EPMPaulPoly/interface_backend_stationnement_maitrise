import { Label } from "@mui/icons-material"
import { FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import { SetStateAction } from "react"



const MenuSommaireValidation: React.FC<{
    xMax: number,
    defXMax: React.Dispatch<SetStateAction<number>>,
    nPlots: number,
    defNPlots: React.Dispatch<SetStateAction<number>>,
    variable: 'pred_par_reel'|'reel_par_pred';
    defVariable: React.Dispatch<SetStateAction<'pred_par_reel'|'reel_par_pred'>>
}>
    = (
        props: {
            xMax: number,
            defXMax: React.Dispatch<SetStateAction<number>>,
            nPlots: number,
            defNPlots: React.Dispatch<SetStateAction<number>>,
            variable: 'pred_par_reel'|'reel_par_pred';
            defVariable: React.Dispatch<SetStateAction<'pred_par_reel'|'reel_par_pred'>>
        }
    ) => {
        return (
            <div className='menu-sommaire-validation'>
                <FormControl>
                    <InputLabel id='n-graphs' sx={{
                        color: "#cccccc",
                        paddingBottom: '10px',
                        "&.Mui-disabled": { color: "#cccccc", WebkitTextFillColor: "#cccccc" },
                    }}>
                        Nombre de graphiques
                    </InputLabel>
                    <Select
                        value={String(props.nPlots)}
                        sx={{
                            borderColor: 'white',
                            minWidth: 200,
                            "& .MuiSelect-select": { color: "white", backgroundColor: "#1f1f1f" },
                            "& .MuiSelect-select.Mui-disabled": {
                                color: "#cccccc",
                                WebkitTextFillColor: "#cccccc",
                                opacity: 1,
                            },
                            "& .MuiInput-underline:before": { borderBottomColor: "white" },
                            "& .MuiInput-underline:hover:before": { borderBottomColor: "#ffcc00" },
                        }}
                        labelId='n-graphs'
                        onChange={(e) => props.defNPlots(Number(e.target.value))}
                    >
                        <MenuItem value={2}>2</MenuItem>
                        <MenuItem value={4}>4</MenuItem>
                        <MenuItem value={6}>6</MenuItem>
                        <MenuItem value={8}>8</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                    </Select>
                </FormControl>
                <FormControl>
                    <TextField
                        type='number'
                        label='X max graphiques'
                        value={String(props.xMax)}
                        sx={{
                            input: { color: "white" },
                            label: { color: "white" },
                            "& .MuiOutlinedInput-root": {
                                "& fieldset": { borderColor: "white" },
                                "&:hover fieldset": { borderColor: "lightgray" },
                                "&.Mui-focused fieldset": { borderColor: "white" },
                            },
                        }}
                        InputProps={{
                            inputProps: {
                                step: "any", // allow decimals like 1.5
                                min: "0",    // optional: only allow positive values
                            },
                        }}
                        onChange={(e) => props.defXMax(Number(e.target.value))}
                    />
                </FormControl>
                <FormControl>
                    <InputLabel id='variable' sx={{
                        color: "#cccccc",
                        paddingBottom: '10px',
                        "&.Mui-disabled": { color: "#cccccc", WebkitTextFillColor: "#cccccc" },
                    }}>
                        Variable
                    </InputLabel>
                    <Select
                        value={props.variable}
                        sx={{
                            borderColor: 'white',
                            minWidth: 200,
                            "& .MuiSelect-select": { color: "white", backgroundColor: "#1f1f1f" },
                            "& .MuiSelect-select.Mui-disabled": {
                                color: "#cccccc",
                                WebkitTextFillColor: "#cccccc",
                                opacity: 1,
                            },
                            "& .MuiInput-underline:before": { borderBottomColor: "white" },
                            "& .MuiInput-underline:hover:before": { borderBottomColor: "#ffcc00" },
                        }}
                        labelId='variable'
                        onChange={(e) => props.defVariable(e.target.value as 'pred_par_reel' | 'reel_par_pred')}
                    >
                        <MenuItem value={'pred_par_reel'}>Prédit sur Réel</MenuItem>
                        <MenuItem value={'reel_par_pred'}>Réel sur prédit</MenuItem>
                    </Select>
                </FormControl>
            </div>
        )
    }

export default MenuSommaireValidation