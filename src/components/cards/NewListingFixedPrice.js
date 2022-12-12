import React from 'react';

import { Card } from '@mui/material'
import { Stepper, Step, StepLabel, Button } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { BounceLoader } from 'react-spinners';
import { toast } from "react-hot-toast";
import nft_media_placeholder from 'assets/nft_media_placeholder.png';
import plus_icon from 'assets/plus_icon.png';
import { storeImage } from 'nftStorage';
import { useEneftigoContext } from 'EneftigoContext';
import { getStorageDeposit, viewAccount, addPrimaryListing } from 'nearInterface';

const steps = [
    'General',
    'Asset',
    'Quantity',
    'Pricing',
];

const theme = createTheme({
    components: {
        MuiStepIcon: {
            styleOverrides: {
                root: {
                    color: 'grey',
                    "&.Mui-active": {
                        color: 'var(--eneftigo-blue)',
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
                    color: 'var(--eneftigo-white)',
                    fontSize: '12px',
                    "&.MuiStepLabel-alternativeLabel": {
                        color: 'var(--eneftigo-white)',
                        marginTop: '4px',
                    },
                    "&.Mui-completed": {
                        color: 'var(--eneftigo-green)',
                    },
                    "&.Mui-active": {
                        color: 'var(--eneftigo-blue)',
                    },
                },
            },
        }
    }
});

async function submitListing({ selector, contractId, account, title, mediaUrl, quantity, priceNear, minBidNear }) {
    let priceYocto = priceNear ? (BigInt(parseInt(priceNear)) * 10n ** 24n).toString() : null;
    let minBidYocto = minBidNear ? (BigInt(parseInt(minBidNear)) * 10n ** 24n).toString() : null;
    const result = await addPrimaryListing({
        selector,
        contractId,
        accountId: account.account_id,
        title,
        mediaUrl,
        supplyTotal: quantity,
        priceYocto,
        minBidYocto,
    });
    return result;
}

export default function CreateFixedPriceListing() {
    const [step, setStep] = React.useState(0);
    const { selector, contractId, account, setAccount, setDeposit } = useEneftigoContext();

    const handleSubmit = (title, mediaUrl, quantity, price) => {
        const promiseChain = submitListing({
            selector: selector,
            contractId: contractId,
            account: account,
            title: title,
            mediaUrl: mediaUrl,
            quantity: quantity,
            priceNear: price,
        }).then(({ collectionId, updatedDeposit }) => {
            // console.log(collectionId);
            // console.log(updatedDeposit);
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
                        // console.log("updated balance " + updatedAccountData.amount);
                        const updatedAccount = {
                            account_id: account.account_id,
                            ...updatedAccountData,
                        };
                        setAccount(updatedAccount);
                    })
                ]);
            } catch (error) {
                console.log(error);
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

    return (
        <>
            <div style={{ textAlign: "center", position: "relative", marginLeft: "auto", marginRight: "auto", borderRadius: 3, p: 1, height: "450px", width: "600px" }}>
                <Stepper activeStep={step} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <CreatePage
                    step={step}
                    onPrev={() => setStep(step - 1)}
                    onNext={() => setStep(step + 1)}
                    onSubmit={handleSubmit}
                    style={{ marginBlockStart: "24px" }}
                />
            </div>
        </>
    );
}

function CreatePage({ step, onPrev, onNext, onSubmit }) {

    const [title, setTitle] = React.useState("");
    const [mediaUrl, setMediaUrl] = React.useState("");
    const [quantity, setQuantity] = React.useState("");
    const [price, setPrice] = React.useState("");

    switch (step) {
        case 0:
            return (<>
                <CreatePageBasic
                    title={title}
                    onTitleChange={(title) => setTitle(title)}
                    onNext={onNext}
                />
            </>);
        case 1:
            return (<>
                <CreatePageMedia
                    url={mediaUrl}
                    onUrlChange={(url) => setMediaUrl(url)}
                    onPrev={onPrev}
                    onNext={onNext}
                />
            </>);
        case 2:
            return (<>
                <CreatePageQuantity
                    quantity={quantity}
                    onQuantityChange={(quantity) => setQuantity(quantity)}
                    onPrev={onPrev}
                    onNext={onNext}
                />
            </>);
        case 3:
            return (<>
                <CreatePagePricing
                    price={price}
                    onPriceChange={(price) => setPrice(price)}
                    onPrev={onPrev}
                    onNext={onNext}
                />
            </>);
        case 4:
            return (<>
                <CreatePagePreview
                    title={title}
                    url={mediaUrl}
                    quantity={quantity}
                    price={price}
                    onPrev={onPrev}
                    onSubmit={(e) => onSubmit(title, mediaUrl, quantity, price)}
                />
            </>);
    }
}

function CreatePageBasic({ title, onTitleChange, onNext }) {

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
            <p style={{ margin: "24px" }}>Your NFT listing needs a title</p>
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

function CreatePageMedia({ url, onUrlChange, onPrev, onNext }) {
    const [busy, setBusy] = React.useState(false);

    const onSelectFile = (e) => {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = "image/png, image/jpeg";
        input.onchange = (e) => {
            setBusy(true);
            const image = e.target.files[0];
            // Promise.resolve("cid")
            storeImage(image)
                .then((cid) => {
                    setBusy(false);
                    onUrlChange("https://ipfs.io/ipfs/" + cid);
                })
                .catch((error) => {
                    console.log("ERROR: " + error);
                })
        }
        input.click();
    };

    return (
        <>
            <p style={{ margin: "24px" }}>It needs an image, too</p>
            <div style={{ position: "relative", textAlign: "center" }}>
                <img
                    src={url !== "" ? url : nft_media_placeholder}
                    width="200"
                    height="200"
                    alt="NFT"
                    onClick={onSelectFile} />
                {(url === "" && !busy) &&
                    <img
                        src={plus_icon}
                        width="50"
                        height="50"
                        style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
                        onClick={onSelectFile} />
                }
                {busy &&
                    <div><BounceLoader color="#DD3333" style={{ position: "absolute", top: "35%", left: "45%" }} /><p>UPLOADING TO IPFS</p></div>
                }
            </div>
            <button style={{ position: "absolute", left: "64px", bottom: "24px" }} onClick={onPrev}>PREV</button>
            {url !== "" ?
                <button style={{ position: "absolute", right: "64px", bottom: "24px" }} onClick={onNext}>NEXT</button> :
                <button disabled style={{ position: "absolute", right: "64px", bottom: "24px" }} onClick={onNext}>NEXT</button>
            }
        </>
    );
}

function CreatePageQuantity({ quantity, onQuantityChange, onPrev, onNext }) {

    const quantityValidator = (quantity) => {
        if (quantity !== "" && quantity < 1) {
            return "You must offer at least 1";
        } else if (quantity > 1000) {
            return "Maximum quantity is 1000";
        } else {
            return null;
        }
    };

    const [quantityError, setQuantityError] = React.useState(quantityValidator(quantity));

    return (
        <>
            <p style={{ margin: "24px" }}>How many NFTs do you want to offer?</p>
            <QuantityInput
                quantity={quantity}
                error={quantityError}
                onChange={(quantity) => {
                    setQuantityError(quantityValidator(quantity));
                    onQuantityChange(quantity);
                }} />
            <p>
                <button style={{ position: "absolute", left: "64px", bottom: "24px" }} onClick={onPrev}>PREV</button>
                {quantityError === null && quantity > 0 ?
                    <button style={{ position: "absolute", right: "64px", bottom: "24px" }} onClick={onNext}>NEXT</button> :
                    <button disabled style={{ position: "absolute", right: "64px", bottom: "24px" }} onClick={onNext}>NEXT</button>
                }
            </p>
        </>
    );
}

function CreatePagePricing({ price, onPriceChange, onPrev, onNext }) {

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
            <p style={{ margin: "24px" }}>How much NEAR do you want to sell them for (per item)?</p>
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

function CreatePagePreview({ title, url, quantity, price, onPrev, onSubmit }) {
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
            <p>Listing {quantity} NFTs for {price} NEAR each</p>
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

function QuantityInput({ quantity, error, onChange }) {
    if (error !== null) {
        return (
            <>
                <TextField
                    error
                    required
                    type="number"
                    label="Quantity"
                    helperText={error}
                    onChange={(e) => onChange(e.target.value)}
                    pattern="[0-9!]"
                    defaultValue={quantity}
                    autoComplete="off"
                />
            </>
        );
    } else {
        return (
            <>
                <TextField
                    required
                    label="Quantity"
                    type="number"
                    onChange={(e) => onChange(e.target.value)}
                    pattern="[0-9!]"
                    defaultValue={quantity}
                    autoComplete="off"
                />
            </>
        );
    }
}
