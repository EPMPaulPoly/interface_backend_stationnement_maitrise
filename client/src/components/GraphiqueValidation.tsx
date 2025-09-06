import { useEffect, useState } from "react";
import { data_graphique, FeuilleFinaleStrate, inventaire_stationnement } from "../types/DataTypes";
import { ArrowBack, Settings } from "@mui/icons-material";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Bar } from "react-chartjs-2";
import serviceValidation from "../services/serviceValidation";


const GraphiqueValidation: React.FC<{ feuilleSelect: FeuilleFinaleStrate, inventairePert: inventaire_stationnement }> = (props: { feuilleSelect: FeuilleFinaleStrate, inventairePert: inventaire_stationnement }) => {
    const [editParam, defEditParam] = useState<boolean>(false)
    const [typeGraphique, defTypeGraphique] = useState<string>('stationnement')
    const [data, defData] = useState<data_graphique>({
        labels: [0],
        datasets: [{
            label: `N/A`,
            data: [0]
        }],
    })
    const [options, setOptions] = useState<any>({
        maintainAspectRatio: false,
        plugins: {},
        scales: {}
    });
    const color=['red','blue']
    useEffect(() => {
        const fetchData = async () => {
            if (props.feuilleSelect.id_strate !== -1) {
                try {
                    const out = await serviceValidation.obtiensGraphique({ id_strate: props.feuilleSelect.id_strate, variable: typeGraphique })
                    defData(out.data)
                    if (typeGraphique === 'stationnement' || typeGraphique === 'stationnement_reel' || typeGraphique === 'stationnement_predit') {
                        setOptions({
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    labels: {
                                        color: 'white',
                                        font: {
                                            size: 16,
                                        },
                                    },
                                },
                                title: {
                                    display: true,
                                    text: `Strate ${props.feuilleSelect.id_strate}`,
                                    color: 'white',
                                    font: {
                                        size: 25
                                    }
                                },
                            },
                            scales: {
                                x: {
                                    ticks: {
                                        color: 'white',
                                        font: {
                                            size: 16,
                                        },
                                    },
                                    title: {
                                        display: true,
                                        text: 'Nombre de places',
                                        color: 'white',
                                        font: {
                                            size: 18,
                                        },
                                    }
                                },
                                y: {
                                    ticks: {
                                        color: 'white',
                                        font: {
                                            size: 16,
                                        },
                                    },
                                    title: {
                                        display: true,
                                        text: 'Fréquence',
                                        color: 'white',
                                        font: {
                                            size: 18,
                                        },
                                    }
                                },
                            },
                        })
                    } else if(typeGraphique==='pred_par_reel'){
                        setOptions({
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    labels: {
                                        color: 'white',
                                        font: {
                                            size: 16,
                                        },
                                    },
                                },
                                title: {
                                    display: true,
                                    text: `Strate ${props.feuilleSelect.id_strate}`,
                                    color: 'white',
                                    font: {
                                        size: 25
                                    }
                                },
                            },
                            scales: {
                                x: {
                                    ticks: {
                                        color: 'white',
                                        font: {
                                            size: 16,
                                        },
                                    },
                                    title: {
                                        display: true,
                                        text: 'Ratio Prédit sur Réel',
                                        color: 'white',
                                        font: {
                                            size: 18,
                                        },
                                    }
                                },
                                y: {
                                    ticks: {
                                        color: 'white',
                                        font: {
                                            size: 16,
                                        },
                                    },
                                    title: {
                                        display: true,
                                        text: 'Fréquence',
                                        color: 'white',
                                        font: {
                                            size: 18,
                                        },
                                    }
                                },
                            },
                        })
                    } else if(typeGraphique==='reel_par_pred'){
                        setOptions({
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    labels: {
                                        color: 'white',
                                        font: {
                                            size: 16,
                                        },
                                    },
                                },
                                title: {
                                    display: true,
                                    text: `Strate ${props.feuilleSelect.id_strate}`,
                                    color: 'white',
                                    font: {
                                        size: 25
                                    }
                                },
                            },
                            scales: {
                                x: {
                                    ticks: {
                                        color: 'white',
                                        font: {
                                            size: 16,
                                        },
                                    },
                                    title: {
                                        display: true,
                                        text: 'Ratio Réel sur Prédit',
                                        color: 'white',
                                        font: {
                                            size: 18,
                                        },
                                    }
                                },
                                y: {
                                    ticks: {
                                        color: 'white',
                                        font: {
                                            size: 16,
                                        },
                                    },
                                    title: {
                                        display: true,
                                        text: 'Fréquence',
                                        color: 'white',
                                        font: {
                                            size: 18,
                                        },
                                    }
                                },
                            },
                        })
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                } finally {
                    //props.defCharge(false);
                }
            }
        };
        fetchData();
    }, [props.inventairePert, props.feuilleSelect]);
    return (<div className='panneau-graph'>
        {editParam ? (
            <>
                <ArrowBack onClick={() => defEditParam(false)} />
                <FormControl>
                    <InputLabel id='select-type'>
                        Variable
                    </InputLabel>
                    <Select label='select-type' value={typeGraphique} onChange={(e) => defTypeGraphique(e.target.value)}>
                        <MenuItem value='stationnement'>Stat réel et prédit</MenuItem>
                        <MenuItem value='stationnement_reel'>Stat réel </MenuItem>
                        <MenuItem value='stationnement_predit'>Stat réel </MenuItem>
                        <MenuItem value='pred_par_reel'>Ratio prédit sur réel</MenuItem>
                        <MenuItem value='reel_par_predit'>Ratio réel sur prédit</MenuItem>
                    </Select>
                </FormControl>
            </>
        ) : (
            <>
                <Settings onClick={() => defEditParam(true)} />
                <div className='graphique'>
                <Bar
                    data={{
                            ...data,
                            datasets: data.datasets.map((ds, i) => {
                                return {
                                    ...ds,
                                    color: color[ i],
                                    backgroundColor: color[i]
                                };
                            }),
                        }}
                    options={{
                        ...options,
                        plugins: {
                            ...options.plugins,
                            tooltip: {
                                callbacks: {
                                    label: function (context: any) {
                                        // Try to get desc_er and desc_reg_stat if available
                                        const value = context.parsed.y;
                                        let label = '';
                                        label = `Fréquence ${value.toFixed(2)}`
                                        return label;
                                    }
                                }
                            }
                        }
                    }}
                />
                </div>
            </>
        )}

    </div>)
}
export default GraphiqueValidation