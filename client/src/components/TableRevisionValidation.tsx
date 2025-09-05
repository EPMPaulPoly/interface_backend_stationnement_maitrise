import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material"
import { PropsTableRevValid } from "../types/InterfaceTypes"
import { Cancel, Edit, Save } from "@mui/icons-material"
import { useState } from "react"
import { EntreeValidation } from "../types/DataTypes"
import { utiliserContexte } from "../contexte/ContexteImmobilisation"
import serviceValidation from "../services/serviceValidation"

const TableRevisionValidation: React.FC<PropsTableRevValid> = (props: PropsTableRevValid) => {

    const contexte = utiliserContexte();
    const optionCartoChoisie = contexte?.optionCartoChoisie ?? "";
    const changerCarto = contexte?.changerCarto ?? (() => { });
    const optionsCartos = contexte?.optionsCartos ?? [];

    const descriptionCarto = optionsCartos.find((entree) => entree.id === optionCartoChoisie)?.description ?? ''

    const [modif, defModif] = useState<boolean>(false)
    const [ancienVal, defAncienVal] = useState<EntreeValidation>({
        id_strate: 0,
        g_no_lot: '',
        n_places: 0,
        fond_tuile: '',
        id_val:-1
    })
    const handleModVal = () => {
        defAncienVal(props.entreeValid)
        props.defEntreeValid({ ...props.entreeValid, fond_tuile: descriptionCarto })
        defModif(true)
    }
    const handleCancel = () => {
        props.defEntreeValid(ancienVal)
        defModif(false)
    }
    const handleEdit = (target: string) => {
        const newVal: EntreeValidation = { ...props.entreeValid, n_places: Number(target) }
        props.defEntreeValid(newVal)
    }
    const handleSave = async () => {
        props.defEntreeValid({...props.entreeValid,fond_tuile:descriptionCarto})
        if (props.entreeValid.id_val ===-1) {
            const majValid = await serviceValidation.nouveauResultatValidation(props.entreeValid)
            props.defEntreeValid(majValid.data[0])
            props.defNewValid(false)
        } else {
            const majValid = await serviceValidation.modifieResultatValidation(props.entreeValid)
            props.defEntreeValid(majValid.data[0])
        }
        defModif(false)
        defAncienVal({
            id_strate: 0,
            g_no_lot: '',
            n_places: 0,
            fond_tuile: '',
            id_val:-1
        })
    }
    return (<div className='table-validation'>
        <TableContainer component={Paper} sx={{ maxHeight: '30vh' }}>
            <Table sx={{ minWidth: 200 }} aria-label="simple table">
                <TableHead sx={{ position: 'sticky', top: 0, background: 'white' }}>
                    <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell align="center">Valeur</TableCell>
                        <TableCell align="center">Option</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody sx={{ overflowY: 'auto' }}>
                    {['id_inv', 'g_no_lot', 'n_places_min', 'n_places_max', 'methode_estime'].map((champs) => (
                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row" align="center">
                                {champs.replace("_", " ").toUpperCase()}
                            </TableCell>
                            <TableCell component="th" scope="row" align="center">
                                {props.inventairePert[champs as keyof typeof props.inventairePert]}
                            </TableCell>
                            <TableCell component="th" scope="row" align="center">
                                {champs === 'n_places_min' || champs === 'n_places_max' ? <Edit /> : <></>}
                            </TableCell>
                        </TableRow>
                    ))}
                    <TableRow
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell component="th" scope="row" align="center">
                            Adresse
                        </TableCell>
                        <TableCell component="th" scope="row" align="center">
                            {props.adresse}
                        </TableCell>
                        <TableCell component="th" scope="row" align="center">

                        </TableCell>
                    </TableRow>
                    {['id_strate', 'n_places'].map((champsValid) =>
                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row" align="center">
                                {champsValid.replace("_", " ").toUpperCase()}
                            </TableCell>
                            <TableCell component="th" scope="row" align="center">
                                {champsValid === 'n_places' && modif ? <TextField
                                    key={champsValid}
                                    label={champsValid.replace("_", " ").toUpperCase()}
                                    value={props.entreeValid[champsValid as keyof typeof props.entreeValid]} onChange={(e) => handleEdit(e.target.value)} /> : <>{props.entreeValid[champsValid as keyof typeof props.entreeValid]}</>}
                            </TableCell>
                            <TableCell component="th" scope="row" align="center">

                                {champsValid === 'n_places' && modif ? <><Save onClick={() => handleSave()} /><Cancel onClick={handleCancel} /></> : champsValid === 'n_places' ? <><><Edit onClick={() => handleModVal()} /></></> : <></>}
                            </TableCell>
                        </TableRow>)}
                </TableBody>
            </Table>
        </TableContainer>
    </div>)
}

export default TableRevisionValidation