import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material"
import { PropsTableRevValid } from "../types/InterfaceTypes"
import { Cancel, Edit, Save } from "@mui/icons-material"
import { useState } from "react"

const TableRevisionValidation: React.FC<PropsTableRevValid> = (props: PropsTableRevValid) => {
    const [modif,defModif]=useState<boolean>(false)
    return (<div className='table-validation'>
        <TableContainer component={Paper} sx={{maxHeight:'30vh'}}>
            <Table sx={{ minWidth: 200 }} aria-label="simple table">
                <TableHead sx={{position:'sticky',top:0,background:'white'}}>
                    <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell align="center">Valeur</TableCell>
                        <TableCell align="center">Option</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody sx={{overflowY:'auto'}}>
                    {['id_inv','g_no_lot','n_places_min','n_places_max','methode_estime'].map((champs) => (
                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row" align="center">
                                {champs.replace("_"," ").toUpperCase()}
                            </TableCell>
                            <TableCell component="th" scope="row" align="center">
                                {props.inventairePert[champs as keyof typeof props.inventairePert]}
                            </TableCell>
                            <TableCell component="th" scope="row" align="center">
                                {champs==='n_places_min'||champs==='n_places_max'?<Edit/>:<></>}
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
                    {['id_strate','n_places'].map((champsValid)=>
                        <TableRow
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row" align="center">
                                {champsValid.replace("_"," ").toUpperCase()}
                            </TableCell>
                            <TableCell component="th" scope="row" align="center">
                                {champsValid==='n_places' && modif?<TextField 
                                    key={champsValid}
                                    label={champsValid.replace("_", " ").toUpperCase()}
                                    value={props.entreeValid[champsValid as keyof typeof props.entreeValid]}/>:<>{props.entreeValid[champsValid as keyof typeof props.entreeValid]}</>}
                            </TableCell>
                            <TableCell component="th" scope="row" align="center">

                                {champsValid==='n_places'&& modif?<><Save/><Cancel/></>:champsValid==='n_places'?<><><Edit/></></>:<></>}
                            </TableCell>
                        </TableRow>)}
                </TableBody>
            </Table>
        </TableContainer>
    </div>)
}

export default TableRevisionValidation