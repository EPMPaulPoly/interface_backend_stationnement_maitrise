import { FormControl, List, ListItem, ListItemButton, ListItemText, ListSubheader, Box } from "@mui/material"
import { PropsListeLotsValid } from "../types/InterfaceTypes"
import { serviceInventaire } from "../services"
import serviceValidation from "../services/serviceValidation"
import { utiliserContexte } from "../contexte/ContexteImmobilisation"
import { FeatureCollection, Geometry } from "geojson"
import { lotCadastralGeoJsonProperties } from "../types/DataTypes"


const ListeLotsValidation: React.FC<PropsListeLotsValid> = (props: PropsListeLotsValid) => {
    const contexte = utiliserContexte();
    const optionCartoChoisie = contexte?.optionCartoChoisie ?? "";
    const changerCarto = contexte?.changerCarto ?? (() => { });
    const optionsCartos = contexte?.optionsCartos ?? [];

    const urlCarto = optionsCartos.find((entree) => entree.id === optionCartoChoisie)?.URL ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    const attributionCarto = optionsCartos.find((entree) => entree.id === optionCartoChoisie)?.attribution ?? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    const optCarto = optionsCartos.find((entree) => entree.id === optionCartoChoisie)?.description ?? "N/A"

    const handleListClick = async (lot: string) => {
        const inventaire = await serviceInventaire.obtiensInventaireQuery({ g_no_lot: lot, methode_estime: 2 })
        const validation = await serviceValidation.obtiensResultatValidation({ g_no_lot: lot, id_strate: props.feuilleSelect.id_strate })
        if (inventaire.data.length > 0) {
            props.defInventairePert(inventaire.data[0])
        }
        if (validation.data.length > 0) {
            props.defEntreeValid(validation.data[0])
        } else {
            console.log('creation Nouvelle entree valid')
            props.defEntreeValid({ id_strate: props.feuilleSelect.id_strate, fond_tuile: optCarto, g_no_lot: lot, n_places: 0 })
        }
        const foundFeature = props.lots.features.find((feature) => feature.properties.g_no_lot === lot);
        const lotSelect:FeatureCollection<Geometry,lotCadastralGeoJsonProperties> = {
            type: 'FeatureCollection',
            features: foundFeature ? [foundFeature] : [
                {
                    geometry: {
                        type: 'Point',
                        coordinates: [0, 0]
                    },
                    type: 'Feature',
                    properties: {
                        g_no_lot: '',
                        g_va_suprf: 0,
                        g_nb_coo_1: 0,
                        g_nb_coord: 0,
                    }
                }
            ]
        }
        props.defLotSelect(lotSelect)
    }
    return (<>
        <Box
            sx={{
                width: '100%',
                maxWidth: 200,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
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
                    flex: 1
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
                        <ListItemButton onClick={() => handleListClick(item.properties.g_no_lot)} selected={props.inventairePert.g_no_lot === item.properties.g_no_lot}>
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