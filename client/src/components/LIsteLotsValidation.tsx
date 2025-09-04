import { FormControl, List, ListItem, ListItemButton, ListItemText, ListSubheader, Box } from "@mui/material"
import { PropsListeLotsValid } from "../types/InterfaceTypes"
import { serviceInventaire } from "../services"


const ListeLotsValidation: React.FC<PropsListeLotsValid> = (props: PropsListeLotsValid) => {
    const handleListClick=async(lot:string)=>{
        const inventaire = await serviceInventaire.obtientInventaireParId(lot)
        const inventaire_pert =  inventaire.data.find((item)=>item.methode_estime==2)
        if (inventaire_pert!==undefined){
            
        }
    }
    return (<>
        <Box
            sx={{ width: '100%', 
                maxWidth: 200, 
                display: 'flex',
                flexDirection: 'column',
                overflow:'hidden'
            }}
        >

            <Box
                sx={{
                    bgcolor: '#1f1f1f',
                    color: 'white',
                    py: 1,
                    px: 2,
                }}
            >
                <ListSubheader
                    component="div"
                    sx={{ color: 'inherit', bgcolor: 'inherit', p: 0 }}
                >
                    Items à valider
                </ListSubheader>
            </Box>

            {/* ── Zone défilante ── */}
            <Box
                sx={{       // hauteur de la zone scrollable
                    overflowY: 'auto',    // ← active le scroll
                    bgcolor: '#1f1f1f',
                    flex:1
                }}
            >
                <List
                    sx={{
                        width: '100%',
                        maxWidth: 200,
                        bgcolor: "#1f1f1f",
                        color: "white",
                        overflowY: 'auto'
                    }}
                    dense={true}
                    component="nav"
                    aria-labelledby="nested-list-subheader"
                >

                    {props.lots.features.map((item) => (
                        <ListItemButton onClick={()=>handleListClick(item.properties.g_no_lot)}>
                            <ListItemText
                                primary={item.properties.g_no_lot}
                                primaryTypographyProps={{
                                    sx: {
                                        color: "white",
                                        bgcolor: "#1f1f1f"
                                    }
                                }}
                            />
                        </ListItemButton>
                    ))}

                </List>
            </Box>
        </Box>
    </>)
}
export default ListeLotsValidation