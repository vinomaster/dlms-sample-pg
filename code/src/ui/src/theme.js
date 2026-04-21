/**
 * Copyright (c) 2024 Discover Financial Services
 */
import { themes } from '@mui/material';
import { createTheme, lighten } from '@mui/material/styles';
let customTheme = createTheme(themes.dfsTheme, {
    //spacing: 8, //default
    palette: {
        main: {
            discoverOrange: '#7E57C2', //"#512DA8", //"#008",
        },
        primary: {
            main: '#D02670', //"#512DA8", //"#008",
        },
        secondary: {
            main: '#7E57C2',
        },
    },
    typography: {
        htmlFontSize: 14, //16,
        fontSize: 16, //14, //16,
        caption: {
            fontSize: 16,
        },
    },
    shape: {
        borderRadius: 12,
    },
});

//console.log("THEME=",customTheme);

customTheme = createTheme(customTheme, {
    components: {
        ...themes.dfsTheme.components,
        MuiButton: {
            styleOverrides: {
                root: {
                    backgroundColor: customTheme.palette.primary.main,
                    fontSize: customTheme.typography.fontSize,
                    borderRadius: customTheme.shape.borderRadius,
                    textTransform: 'uppercase',
                    color: customTheme.palette.common.white,
                    '&:hover': {
                        backgroundColor: lighten(
                            customTheme.palette.primary.main,
                            0.5
                        ),
                    },
                },
                containedPrimary: {
                    backgroundColor: customTheme.palette.primary.main,
                    //color: "blue",
                    '&:hover': {
                        backgroundColor: lighten(
                            customTheme.palette.primary.main,
                            0.5
                        ),
                    },
                    '&:disabled': {
                        backgroundColor: customTheme.palette.primary.main,
                        color: customTheme.palette.common.white,
                        borderColor: customTheme.palette.primary.main,
                    },
                },
            },
        },
        // MuiInputLabel: {
        //     root: {
        //         display: "none",
        //     }
        // },
        MuiOutlinedInput: {
            ...themes.dfsTheme.components.MuiOutlinedInput,
            styleOverrides: {
                root: {
                    ...themes.dfsTheme.components.MuiOutlinedInput
                        .styleOverrides.root,
                    minHeight: '25px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    lineHeight: '21px',
                    letterSpacing: 'normal',
                },
                input: {
                    //padding: "14px 14px 0px 14px", //"25px 14px 14px 14px"
                },
                //   notchedOutline: {
                //     borderColor: theme.palette.tints(theme.palette.main.midnight)[0.5],
                //     top: 0,
                //     "& legend": {
                //       display: "none"
                //     }
                //   }
                // },
                // variants: [
                //   {
                //     props: { variant: "supplementalInfo" },
                //     style: {
                //       minHeight: "55px",
                //       "& .MuiOutlinedInput-input": { paddingTop: "15px" }
                //     }
                //   }
                // ]
            },
        },
        MuiDataGrid: {
            styleOverrides: {
                root: {
                    fontSize: 16, //customTheme.typography.fontSize,
                    typology: {
                        fontSize: 24,
                    },
                    '& .MuiDataGrid-columnHeader': {
                        backgroundColor: customTheme.palette.secondary.main,
                        color: customTheme.palette.primary.contrastText,
                        padding: customTheme.spacing(1.25), //"10px",
                        border: '1px solid white',
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                        fontWeight: 700,
                    },
                    '& .MuiDataGrid-row': {
                        backgroundColor: '#dedede',
                    },
                    '& .MuiDataGrid-cell': {
                        paddingLeft: customTheme.spacing(1),
                        paddingRight: customTheme.spacing(1),
                        //borderColor: "#ffffff",
                        border: '1px solid white',
                        //whiteSpace: "normal !important",
                        //wordWrap: "break-word !important",
                    },
                    '& .MuiDataGrid-cell:focus': {
                        outline: 'none',
                    },
                    '& .MuiDataGrid-sortIcon': {
                        color: 'white',
                    },
                    // "& .MuiButtonBase-root-MuiIconButton-root:focus": {
                    //     outline: "none",
                    //     borderColor: "none",
                    //     boxShadow: "none",
                    // },
                    // "& .MuiButtonBase-root-MuiButton-root:hover": {
                    //     backgroundColor: "#dedede",
                    // },
                    '& .MuiDataGrid-menuIconButton': {
                        color: 'white',
                    },
                    '& .MuiDataGrid-footerContainer': {
                        backgroundColor: '#dedede',
                        //backgroundColor: "#f5f5f5",
                        border: '1px solid white',
                        borderBottomLeftRadius: '12px',
                        borderBottomRightRadius: '12px',
                    },

                    //doesn't work right?
                    // "& .MuiButton-root": {
                    //     color: "white",
                    //     backgroundColor: "black",
                    // },
                    // "& MuiButtonBase-root-MuiButton-root:hover": {
                    //     color: "white",
                    //     backgroundColor: "red",
                    // },

                    fontFamily: 'sans-serif',
                },
            },
        },

        MuiSwitch: {
            styleOverrides: {
                root: {
                    backgroundColor:
                        customTheme.palette.primary.main + ' !important',
                    fontSize: customTheme.typography.fontSize,
                    borderRadius: customTheme.shape.borderRadius,
                    textTransform: 'uppercase',
                    color: customTheme.palette.common.white,
                },
            },
        },

        MuiCheckbox: {
            styleOverrides: {
                root: {
                    '&.MuiCheckbox-root': {},
                    '&.Mui-checked .MuiSvgIcon-root': {
                        backgroundColor:
                            customTheme.palette.primary.main + '20 !important',
                        boxShadow:
                            'inset 0 0 0 2px ' +
                            customTheme.palette.primary.main +
                            ' !important',
                    },
                },
            },
        },

        // Doesn't change radio button font size
        MuiRadio: {
            styleOverrides: {
                root: {
                    fontSize: customTheme.typography.fontSize,
                    typology: {
                        fontSize: 16,
                    },
                },
            },
        },
        // Mike will check
        MuiFormControlLabel: {
            styleOverrides: {
                label: {
                    fontSize: 10,
                },
            },
        },
    },
});

export { customTheme };
