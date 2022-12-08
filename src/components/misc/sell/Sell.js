import React, { Component, useState } from 'react';
import Modal from '@mui/material/Modal';
import { useEneftigoContext } from 'EneftigoContext.js';

import { Card, Box } from '@mui/material'
import { Stepper, Step, StepLabel, Button } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { toast } from "react-hot-toast";
import { nftApprove, getStorageDeposit, viewAccount } from 'nearInterface';
import { EneftigoModal } from 'EneftigoModal';


export default function Sell({ nft }) {
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <p style={{ margin: "5px", textAlign: 'center' }}>
                <ButtonSell onClick={handleOpen} />
            </p>
            {<SecondaryListingWorkflow nft={nft} open={open} handleClose={handleClose} />}
        </>
    );
}

function ButtonSell({ onClick }) {
    return (
        <>
            <button className="listing_buy_thumb" onClick={onClick}>
                SELL
            </button>
        </>
    )
}


const steps = [
    'General',
    'Pricing',
];

const theme = createTheme({
    components: {
        // Name of the component
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
        }
    }
});

async function submitListing({ selector, contractId, account, nft, title, priceNear, minBidNear, start_date, end_date }) {
    let priceYocto = priceNear ? (BigInt(parseInt(priceNear)) * 10n ** 24n).toString() : null;
    let minBidYocto = minBidNear ? (BigInt(parseInt(minBidNear)) * 10n ** 24n).toString() : null;
    let msg = {
        action: "add_listing",
        token_metadata: nft.metadata,
        price_yocto: priceYocto,
        min_bid_yocto: minBidYocto,
        start_date,
        end_date,
    };
    return await nftApprove({
        selector,
        sellerId: account.account_id,
        nftContractId: nft.contract_id,
        tokenId: nft.token_id,
        approvedAccountId: contractId,
        msg: msg,
    });
}

function SecondaryListingWorkflow({ nft, open, handleClose }) {
    const [step, setStep] = React.useState(0);
    const { selector, contractId, account, setAccount, setDeposit } = useEneftigoContext();

    const handleSubmit = (title, price) => {
        const promiseChain = submitListing({
            selector: selector,
            contractId: contractId,
            account: account,
            nft: nft,
            title: title,
            priceNear: price,
        }).then(({ collectionId, updatedDeposit }) => {
            console.log(collectionId);
            console.log(updatedDeposit);
        }).then(async () => {
            try {
                return await Promise.all([
                    getStorageDeposit({
                        selector: selector,
                        contractId: contractId,
                        accountId: account.account_id,
                    }).then((updatedDeposit) => {
                        setDeposit(BigInt(updatedDeposit));
                    }),
                    viewAccount({
                        selector: selector,
                        accountId: account.account_id,
                    }).then((updatedAccountData) => {
                        console.log("updated balance " + updatedAccountData.amount);
                        const updatedAccount = {
                            account_id: account.account_id,
                            ...updatedAccountData,
                        };
                        setAccount(updatedAccount);
                    })
                ]);
            } catch (error) {
                return console.log(error);
                // the listing has been added nevertheless so we don't propagate (and display) the error
            }
        });

        toast.promise(
            promiseChain,
            {
                loading: 'Adding NFT listing...',
                success: <p style={{ margin: '0px' }}>NFT listing created!</p>,
                error: (error) => <p style={{ margin: '0px' }}>Could not create NFT listing<br /><span style={{ fontSize: 'var(--eneftigo-font-size-small)' }}>{error.message}</span></p>,
            },
            {
                style: {
                    minWidth: '300px',
                },
                success: {
                    duration: 5000,
                    icon: '👍',
                },
            }
        );
    };

    const content =
        <div style={{ margin: "16px 32px 32px 32px" }}>

            <Box sx={{ position: "relative", marginLeft: "auto", marginRight: "auto", borderRadius: 3, p: 1, height: "450px", width: "500px" }}>
                <ThemeProvider theme={theme}>
                    <Stepper activeStep={step} alternativeLabel>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </ThemeProvider>
                <div className="container">
                    <SecondaryListingWorkflowPage
                        nft={nft}
                        step={step}
                        onPrev={() => setStep(step - 1)}
                        onNext={() => setStep(step + 1)}
                        onSubmit={handleSubmit}
                        style={{ marginBlockStart: "24px" }}
                    />
                </div>
            </Box>
        </div>

    return (
        <>
            <EneftigoModal
                open={open}
                title="ADD NFT LISTING"
                handleClose={handleClose}
                content={content}
            />
        </>
    );
}

function SecondaryListingWorkflowPage({ nft, step, onPrev, onNext, onSubmit }) {

    const [title, setTitle] = React.useState(nft.metadata.title);
    const [price, setPrice] = React.useState("");

    switch (step) {
        case 0:
            return (<>
                <SecondaryListingWorkflowBasic
                    title={title}
                    onTitleChange={(title) => setTitle(title)}
                    onNext={onNext}
                />
            </>);
        case 1:
            return (<>
                <SecondaryListingWorkflowPricing
                    price={price}
                    onPriceChange={(price) => setPrice(price)}
                    onPrev={onPrev}
                    onNext={onNext}
                />
            </>);
        case 2:
            return (<>
                <SecondaryListingWorkflowPreview
                    title={title}
                    url={nft.metadata.media}
                    price={price}
                    onPrev={onPrev}
                    onSubmit={(e) => onSubmit(title, price)}
                />
            </>);
    }
}

function SecondaryListingWorkflowBasic({ title, onTitleChange, onNext }) {

    const titleValidator = (title) => {         // returns error or null
        if (title.length > 0 && title.length < 4) {
            return "Must be at least 4 characters";
        } else if (title.length > 128) {
            return "Cannot be longer than 128 characters";
        } else {
            return null;
        }
    }

    const [titleError, setTitleError] = React.useState(titleValidator(title));

    return (
        <>
            <p style={{ textAlign: "center", margin: "24px" }}>Your NFT listing needs a title</p>
            <TitleInput
                title={title}
                error={titleError}
                onChange={(title) => {
                    setTitleError(titleValidator(title));
                    onTitleChange(title);
                }} />
            <p>
                {titleError === null && title.length > 0 ?
                    <button style={{ position: "absolute", right: "64px", bottom: "24px" }} onClick={onNext}>NEXT</button> :
                    <button disabled style={{ position: "absolute", right: "64px", bottom: "24px" }} onClick={onNext}>NEXT</button>
                }
            </p>
        </>
    );
}

function SecondaryListingWorkflowPricing({ price, onPriceChange, onPrev, onNext }) {

    const priceValidator = (price) => {
        if (price != "" && price < 1) {
            return "Minimum price is 1 NEAR";
        } else if (price > 1000000) {
            return "Price is too high";
        } else {
            return null;
        }
    };

    const [priceError, setPriceError] = React.useState(priceValidator(price));

    return (
        <>
            <p style={{ margin: "24px" }}>How much NEAR do you want to sell it for?</p>
            <PriceInput
                price={price}
                error={priceError}
                onChange={(price) => {
                    setPriceError(priceValidator(price));
                    onPriceChange(price);
                }} />
            <p>
                <button style={{ position: "absolute", left: "64px", bottom: "24px" }} onClick={onPrev}>PREV</button>
                {priceError === null && price > 0 ?
                    <button style={{ position: "absolute", right: "64px", bottom: "24px" }} onClick={onNext}>PREVIEW</button> :
                    <button disabled style={{ position: "absolute", right: "64px", bottom: "24px" }} onClick={onNext}>PREVIEW</button>
                }
            </p>
        </>
    );
}

function SecondaryListingWorkflowPreview({ title, url, quantity, price, onPrev, onSubmit }) {
    return (
        <>
            <p>You are just about to place the NFT listing:</p>
            <p>{title}</p>
            <img
                src={url}
                width="200"
                height="200"
                alt="MEDIA"
            />
            <p>Asking price: {price} NEAR</p>
            <button style={{ position: "absolute", left: "64px", bottom: "24px" }} onClick={onPrev}>PREV</button>
            <button style={{ position: "absolute", right: "64px", bottom: "24px" }} onClick={onSubmit}>SUBMIT</button> :
        </>
    );
}

function TitleInput({ title, error, onChange }) {
    if (error !== null) {
        return (
            <>
                <TextField
                    error
                    required
                    label="Title"
                    helperText={error}
                    onChange={(e) => onChange(e.target.value)}
                    defaultValue={title}
                    autoComplete="off"
                />
            </>
        );
    } else {
        return (
            <>
                <TextField
                    required
                    label="Title"
                    onChange={(e) => onChange(e.target.value)}
                    defaultValue={title}
                    autoComplete="off"
                />
            </>
        );
    }
}

function PriceInput({ price, error, onChange }) {
    if (error !== null) {
        return (
            <>
                <TextField
                    error
                    required
                    type="number"
                    label="Price"
                    helperText={error}
                    onChange={(e) => onChange(e.target.value)}
                    defaultValue={price}
                    autoComplete="off"
                />
            </>
        );
    } else {
        return (
            <>
                <TextField
                    required
                    label="Price"
                    type="number"
                    onChange={(e) => onChange(e.target.value)}
                    defaultValue={price}
                    autoComplete="off"
                />
            </>
        );
    }
}





/*function SellModal({ nft, open, onClose }) {

    const { selector, contractId, account, setAccount, setDeposit } = useEneftigoContext();

    console.log(nft);

    const handleClose = () => {
        onClose();
    };

    const handleSell = async () => {
        try {
            await addSecondaryListing({
                selector,
                marketplaceContractId: contractId,
                sellerId: account.account_id,
                nftContractId: nft.contract_id,
                tokenId: nft.token_id,
                nftMetadata: nft.metadata,
                priceYocto: "200000000000000",

                startDate: null,
                endDate: null,
            });
        } catch (error) {

        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="buy-modal-title"
            aria-describedby="buy-modal-description"
        >
            <Box sx={{ width: 600, borderRadius: "10px" }}>
                <h2 id="buy-modal-title">Sell '{nft.metadata.title}'</h2>
                <p style={{ textAlign: 'center' }} id="buy-modal-description">
                    You are just about to list the NFT for sale.
                </p>
                <p style={{ textAlign: 'center' }} id="buy-modal-description">
                    Are you sure you want to continue with your listing?
                </p>
                <div className="flex-container" style={{ justifyContent: "space-evenly" }}>
                    <button style={{ width: "100px" }} className="cancel" onClick={handleClose}>LET ME THINK</button>
                    <button style={{ width: "100px" }} onClick={handleSell}>YES, I WANT TO SELL</button>
                </div>
            </Box>
        </Modal>
    );
}*/