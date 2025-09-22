import { useEffect, useState } from "react";
import serviceValidation from "../services/serviceValidation";
import { data_graphique, FeuilleFinaleStrate } from "../types/DataTypes";
import { ArrowBack, Settings } from "@mui/icons-material";
import { FormControl, MenuItem, Select } from "@mui/material";
import { Bar } from "react-chartjs-2";


const GraphiqueSommaireValidation: React.FC<{xMax:number,variable:'pred_par_reel'|'reel_par_pred'}>=(props:{xMax:number,variable:'pred_par_reel'|'reel_par_pred'})=>{
    const [idStrate,defIdStrate] = useState<number>(-1)
    const [menuVis,defMenuVis] = useState<boolean>(false);
    const [feuillesDispo,defFeuillesDispo] = useState<FeuilleFinaleStrate[]>([]);
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
    useEffect(()=>{
        const fetchData = async () => {
            if (idStrate!== -1) {
                try {
                    const out = await serviceValidation.obtiensGraphique({ id_strate: idStrate, variable: props.variable as string })
                    defData(out.data)
                    if (props.variable === 'pred_par_reel') {
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
                                    text: `Strate ${idStrate}`,
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
                    } else if (props.variable === 'reel_par_pred') {
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
                                    text: `Strate ${idStrate}`,
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
        
    },[])
    const obtiensDonneesGraphe = async(idStrateSelect:number)=>{
        if (idStrateSelect!== -1) {
            try {
                defIdStrate(idStrateSelect)
                const out = await serviceValidation.obtiensGraphique({ id_strate: idStrateSelect, variable: props.variable as string,x_max:props.xMax })
                defData(out.data)
                if (props.variable === 'pred_par_reel') {
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
                                text: `${feuillesDispo.find((row)=>row.id_strate===idStrateSelect)?.desc_concat??'N/A'}`,
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
                } else if (props.variable === 'reel_par_pred') {
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
                                text: `${feuillesDispo.find((row)=>row.id_strate===idStrateSelect)?.desc_concat??'N/A'}`,
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
        } else{
            defData({
                labels: [0],
                datasets: [{
                    label: `N/A`,
                    data: [0]
                }],
            })
        }
    }
    useEffect(() => {
        const fetchData = async()=>{
            if (menuVis===true){
                const feuilles = await serviceValidation.obtiensFeuilles();
                defFeuillesDispo(feuilles.data)
            }
        }
        fetchData();
    }, [menuVis]);
    return(<>
        {
            menuVis?(<>
                <ArrowBack
                    onClick={()=>defMenuVis(false)}
                />
                <FormControl>
                    <Select
                        value= {idStrate}
                        onChange ={(e)=>obtiensDonneesGraphe(Number(e.target.value))}
                    >
                        <MenuItem value={-1}>Aucune Selection</MenuItem>
                        {feuillesDispo.map((row)=><MenuItem value={row.id_strate}>{row.desc_concat}</MenuItem>)}
                    </Select>
                </FormControl>
            </>
            ):(<>
                <Settings
                    onClick={()=>defMenuVis(true)}
                />
            
                <Bar
                    data={{
                        ...data,
                        datasets: data.datasets.map((ds, i) => {
                            return {
                                ...ds,
                                backgroundColor:'red'
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
                    style={{ flex: 1, minHeight: 0 }}
                />
            
            </>)
        }
    </>)
}

export default GraphiqueSommaireValidation