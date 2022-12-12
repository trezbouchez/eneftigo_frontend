// import 'regenerator-runtime/runtime';
import React, { useContext } from 'react';
import { Route, Routes } from "react-router-dom"
import { EneftigoContext, EneftigoContextAware } from 'EneftigoContext';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { PuffLoader } from 'react-spinners';
import { Toaster } from 'react-hot-toast';

import 'global.css';

import "@near-wallet-selector/modal-ui/styles.css";

import { SignInPrompt } from 'components/login/SignInPrompt';

import NavBar from 'components/navbar/Navbar';

import Home from "components/pages/home/Home";
import Listings from "components/pages/listings/Listings";

import TransactionResult from "components/misc/TransactionResult";


export default function App() {
    return EneftigoContextAware(AppContent);
}

const themeEneftigoDefault = createTheme({
    components: {
        // Name of the component
        MuiCard: {
            styleOverrides: {
                root: {
                    // backgroundColor: 'var(--eneftigo-black)',
                    color: 'var(--eneftigo-black)'
                },
            },
        },
        // MuiPaper: {

        MuiStepIcon: {
            styleOverrides: {
                root: {
                    color: 'grey',
                    "&.Mui-active": {
                        color: 'var(--eneftigo-red)',
                    },
                    "&.Mui-completed": {
                        color: 'var(--eneftigo-green)',
                    },
                },
            }
        },
        MuiStepLabel: {
            styleOverrides: {
                label: {
                    font: 'var(--eneftigo-text-font-family)',
                    fontSize: '12px',
                    "&.MuiStepLabel-alternativeLabel": {
                        marginTop: '4px',
                    },
                },
            },
        },
        MuiButtonBase: {
            styleOverrides: {
                root: {
                    font: 'var(--eneftigo-text-font-family)',
                    fontSize: '12px',
                    "&.Mui-selected": {
                        font: 'var(--eneftigo-text-font-family)',
                        fontSize: '12px',
                        // color: 'var(--eneftigo-red)',
                    },
                },
            }
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    font: 'var(--eneftigo-text-font-family)',
                    fontSize: '12px',
                    "&.Mui-selected": {
                        font: 'var(--eneftigo-text-font-family)',
                        fontSize: '12px',
                    },
                },
            }
        },
        MuiBox: {
            styleOverrides: {
                root: {
                    backgroundColor: 'var(--bg)',
                    font: 'var(--eneftigo-text-font-family)',
                    fontSize: '36px',
                    color: 'var(--fg)',
                },
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    margin: '0px',
                    padding: '0px',
                    textAlign: "right",
                },
            }
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    borderRadius: '3px',
                    margin: '0px',
                    padding: '0px',
                    color: 'var(--eneftigo-white)',
                    fontFamily: 'var(--eneftigo-mono-font-family)',
                    textAlign: "right",
                },
                input: {
                    margin: '0px',
                    padding: '0px',
                    color: 'var(--eneftigo-white)',
                    fontFamily: 'var(--eneftigo-mono-font-family)',
                    textAlign: "right",
                },            
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                input: {
                    borderRadius: '3px',
                    margin: 'auto',
                    padding: '0px',
                    color: 'var(--eneftigo-white)',
                    fontFamily: 'var(--eneftigo-mono-font-family)',
                    fontSize: "17px",
                    textAlign: "right",
                },
                notchedOutline: {
                    outline: "none",
                }
            }
        }
    },
});


function AppContent() {
    const { loading, account, modal } = useContext(EneftigoContext);
    if (loading) {
        return (
            <>
                <div><PuffLoader color="#DD3333" style={{ position: "absolute", top: "35%", left: "45%" }} /></div>
            </>
        );
    }

    // show modal prompt if not signed-in
    if (!account) {
        return (
            <>
                <SignInPrompt onClick={() => modal.show()} />
            </>
        );
    }

    return (
        <>
            <ThemeProvider theme={themeEneftigoDefault}>
                <NavBar />
                <div className="container">
                    <Toaster
                        containerStyle={{
                            top: 64,
                            left: 20,
                            bottom: 20,
                            right: 20,
                        }}
                        position="top-right" />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/listings" element={<Listings />} />
                        <Route path="/listings/:sellerId" element={<Listings />} />

                    </Routes>
                    <TransactionResult />
                </div>
            </ThemeProvider>
        </>
    );
}