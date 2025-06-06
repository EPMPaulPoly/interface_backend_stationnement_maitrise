import {FC,useState,useEffect} from 'react'
import { serviceEnsemblesReglements } from '../services';
import {ControlAnaRegProps} from '../types/InterfaceTypes';
import { entete_ensembles_reglement_stationnement } from '../types/DataTypes';
import {
    Modal,
    Box,
    Button,
    Autocomplete,
    TextField,
    Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
const ControlAnaReg:FC<ControlAnaRegProps>=(props:ControlAnaRegProps)=>{
    const [tousEnsReg,defTousEnsRegs] = useState<entete_ensembles_reglement_stationnement[]>([])
    const [modalOpen, setModalOpen] = useState(false);
    useEffect(()=>{
        const fetchData=async() =>{
            const reponseEnsReg = await serviceEnsemblesReglements.chercheTousEntetesEnsemblesReglements()
            defTousEnsRegs(reponseEnsReg.data)
        }
        fetchData()
    },[])


    const handleChange = (ngraphiques:number) => {
        props.defNGraphiques(ngraphiques);
    };

    return(<div className="control-comp-reg">
                <FormControl variant="outlined" size="small" style={{ minWidth: 120 }}>
                    <InputLabel id="select-n-charts-label"
                    sx={{
                        color: 'white',
                        '&.Mui-focused': { color: 'white' },
                        '&.MuiInputLabel-shrink': { color: 'white' },
                        }}
                    >
                        N graphes
                    </InputLabel>
                    <Select
                        labelId="select-n-charts-label"
                        id="select-n-charts"
                        value={props.nGraphiques}
                        onChange={(e)=>handleChange(Number(e.target.value))}
                        label="N Graphes"
                        sx={{
                            backgroundColor: 'black',
                            color: 'white',
                            '& .MuiSvgIcon-root': { color: 'white' }, // arrow
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#888' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#aaa' },
                            }}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                bgcolor: 'black',
                                color: 'white',
                                },
                            },
                        }}
                    >
                        {[2,4,6,8,10].map((val) => (
                        <MenuItem 
                            key={val} 
                            value={val}
                            sx={{
                                backgroundColor: 'black',
                                color: 'white',
                                '&.Mui-selected': {
                                    backgroundColor: '#222',
                                    color: 'white',
                                },
                                '&.Mui-selected:hover': {
                                    backgroundColor: '#333',
                                },
                            }}
                        >
                            {val}
                        </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <>
                    <Button onClick={() => setModalOpen(true)} variant="outlined" sx={{
                        ml: 2,
                        color: 'white',
                        borderColor: 'white',
                        '&:hover': {
                        backgroundColor: '#222',
                        borderColor: 'white',
                        },
                    }}>
                        Choisir les règlements ({props.ensRegARep.length} sélectionnés)
                    </Button>

                    <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                        <Box 
                            sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 500,
                            bgcolor: 'black',
                            color: 'white',
                            boxShadow: 24,
                            p: 4,
                            borderRadius: 2,
                            }}
                        >
                            <Autocomplete
                                multiple
                                options={tousEnsReg.map((o) => o.id_er)}
                                getOptionLabel={(ensReg) =>
                                    `${tousEnsReg.find((o) => o.id_er === ensReg)?.description_er ?? ''}`
                                }
                                value={props.ensRegARep}
                                onChange={(_, newValue) => props.defEnsRegARep(newValue)}
                                renderTags={(value, getTagProps) =>
                                    value.map((optionIci, index) => (
                                    <Box
                                        component="div"
                                        sx={{
                                        backgroundColor: '#333',
                                        color: 'white',
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 1,
                                        fontSize: '0.875rem',
                                        mr: 0.5,
                                        }}
                                        {...getTagProps({ index })}
                                    >
                                        {tousEnsReg.find((o) => o.id_er === optionIci)?.description_er}
                                    </Box>
                                    ))
                                }
                                renderInput={(params) => (
                                    <TextField
                                    {...params}
                                    variant="outlined"
                                    label="Sélectionner des règlements"
                                    placeholder="Rechercher..."
                                    sx={{
                                        input: { color: 'white' },
                                        label: { color: 'white' },
                                        '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#888',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#aaa',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#ccc',
                                        },
                                        },
                                    }}
                                    />
                                )}
                                />
                            <Box sx={{ mt: 2, textAlign: 'right' }}>
                                <Button onClick={() => setModalOpen(false)}
                                    sx={{
                                        ml: 2,
                                        color: 'white',
                                        borderColor: 'white',
                                        '&:hover': {
                                        backgroundColor: '#222',
                                        borderColor: 'white',
                                        },
                                    }}>
                                        Fermer
                                </Button>
                            </Box>
                        </Box>
                    </Modal>
                </>
            </div>)
}

export default ControlAnaReg