import React, { useState } from 'react';
import { Stepper, Step, StepLabel, Checkbox, FormControlLabel } from '@mui/material'
import Typography from '@mui/material/styles/createTypography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { toast } from "react-hot-toast";
import { useEneftigoContext } from 'EneftigoContext';
import { getStorageDeposit, viewAccount, addPrimaryListing } from 'nearInterface';
import { SpotifyLink } from "components/misc/SpotifyLink";
import { IpfsImage } from 'components/misc/IpfsImage';
import { fontSize } from '@mui/system';

const steps = [
    'General',
    'Song',
    'Conditions',
    'Preview'
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
        },
        MuiOutlinedInput: {
            styleOverrides: {
                input: {
                    borderRadius: '5px',
                    margin: 'auto',
                    padding: '2px',
                    color: 'var(--eneftigo-white)',
                    backgroundColor: 'var(--eneftigo-very-dark-grey)',
                    fontSize: "17px",
                    textAlign: "center",
                    borderColor: 'var(--eneftigo-grey)',
                },
            },
        }
    }
});

async function submitListing({ selector, contractId, account, title, imageUrl, auxAudioUrl, quantity, priceNear, minBidNear }) {
    let priceYocto = priceNear ? (BigInt(parseInt(priceNear)) * 10n ** 24n).toString() : null;
    let minBidYocto = minBidNear ? (BigInt(parseInt(minBidNear)) * 10n ** 24n).toString() : null;
    const result = await addPrimaryListing({
        selector,
        contractId,
        accountId: account.account_id,
        title,
        imageUrl,
        auxAudioUrl,
        supplyTotal: quantity,
        priceYocto,
        minBidYocto,
    });
    return result;
}

export default function CreateFixedPriceListing() {
    const [step, setStep] = React.useState(0);
    const { selector, contractId, account, setAccount, setDeposit } = useEneftigoContext();

    const handleSubmit = (title, imageUrl, auxAudioUrl, quantity, price) => {
        const promiseChain = submitListing({
            selector: selector,
            contractId: contractId,
            account: account,
            title: title,
            imageUrl: imageUrl,
            auxAudioUrl: auxAudioUrl,
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
            <div
                style={{
                    textAlign: "center",
                    position: "relative",
                    marginLeft: "auto",
                    marginRight: "auto",
                    borderRadius: 3,
                    p: 1,
                    height: "600px",
                    width: "600px"
                }}
            >
                <ThemeProvider theme={theme}>
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
                </ThemeProvider>
            </div>
        </>
    );
}

function CreatePage({ step, onPrev, onNext, onSubmit }) {

    const [title, setTitle] = React.useState("");
    const [imageUrl, setImageUrl] = React.useState(null);
    const [songLink, setSongLink] = React.useState(null);
    const [hasRights, setHasRights] = useState(false);
    const [quantity, setQuantity] = React.useState("");
    const [price, setPrice] = React.useState("");

    switch (step) {
        case 0:
            return (
                <>
                    <General
                        title={title}
                        imageUrl={imageUrl}
                        onTitleChange={(title) => setTitle(title)}
                        onImageUrlChange={(url) => setImageUrl(url)}
                        onNext={onNext}
                    />
                </>
            );
        case 1:
            return (
                <>
                    <Song
                        songLink={songLink}
                        onSongLinkChange={(link) => setSongLink(link)}
                        hasRights={hasRights}
                        onHasRightsChange={(has) => setHasRights(has)}
                        onPrev={onPrev}
                        onNext={onNext}
                    />
                </>
            );
        case 2:
            return (
                <>
                    <Parameters
                        quantity={quantity}
                        price={price}
                        onQuantityChange={(quantity) => setQuantity(quantity)}
                        onPriceChange={(price) => setPrice(price)}
                        onPrev={onPrev}
                        onNext={onNext}
                    />
                </>
            );
        case 3:
            return (
                <>
                    <Preview
                        title={title}
                        imageUrl={imageUrl}
                        songLink={songLink}
                        quantity={quantity}
                        price={price}
                        onPrev={onPrev}
                        onSubmit={(e) => onSubmit(title, imageUrl, songLink, quantity, price)}
                    />
                </>
            );
    }
}

function General({ title, imageUrl, onTitleChange, onImageUrlChange, onNext }) {

    console.log(imageUrl);

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
            <p style={{ fontSize: "12px", opacity: "65%", marginBlockStart: "40px", marginBlockEnd: "12px" }}>Listing Title:</p>
            <div style={{ margin: "auto", width: "300px" }}>
                <TitleInput
                    sx={{ margin: "auto" }}
                    title={title}
                    error={titleError}
                    onChange={(title) => {
                        setTitleError(titleValidator(title));
                        onTitleChange(title);
                    }}
                />
            </div>
            <p style={{ fontSize: "12px", opacity: "65%", marginBlockStart: "40px", marginBlockEnd: "12px" }}>Listing Image:</p>
            <IpfsImage
                initialUrl={imageUrl}
                onImageUrlChange={onImageUrlChange}
            />
            <p>
                {titleError === null && title.length > 0 && imageUrl !== null ?
                    <button style={{ position: "absolute", right: "64px", bottom: "24px" }} onClick={onNext}>NEXT</button> :
                    <button disabled style={{ position: "absolute", right: "64px", bottom: "24px" }} onClick={onNext}>NEXT</button>
                }
            </p>
        </>
    );
}

function Song({ songLink, onSongLinkChange, hasRights, onHasRightsChange, onPrev, onNext }) {

    return (
        <>
            <p style={{ fontSize: "12px", opacity: "65%", marginBlockStart: "40px", marginBlockEnd: "12px" }}>Song:</p>
            <div style={{ position: "relative", textAlign: "center" }}>
                <SpotifyLink
                    initialLink={songLink}
                    onLinkVerified={(link) => {
                        if (!link)
                            onHasRightsChange(false);
                        onSongLinkChange(link);
                    }}
                    preferredHeight={"300"}
                />
            </div>
            <div style={{ visibility: songLink ? "visible" : "hidden", position: "relative", textAlign: "center" }}>
                <FormControlLabel
                    style={{ margin: "auto", position: "relative", bottom: "24px", color: "var(--eneftigo-light-grey" }}
                    componentsProps={{ typography: { fontSize: "12px" } }}
                    control={
                        <Checkbox
                            style={{ color: "var(--eneftigo-grey" }}
                            disabled={!songLink}
                            checked={hasRights}
                            onChange={(e) => onHasRightsChange(e.target.checked)}
                        />
                    }
                    label="I hereby declare that I own the copyrights to the submitted song or its part"
                />
            </div>
            <button style={{ position: "absolute", left: "64px", bottom: "24px" }} onClick={onPrev}>PREV</button>
            {
                songLink !== "" && hasRights ?
                    <button style={{ position: "absolute", right: "64px", bottom: "24px" }} onClick={onNext}>NEXT</button> :
                    <button disabled style={{ position: "absolute", right: "64px", bottom: "24px" }} onClick={onNext}>NEXT</button>
            }
        </>
    );
}

function Parameters({ quantity, price, onQuantityChange, onPriceChange, onPrev, onNext }) {

    const quantityValidator = (quantity) => {
        if (quantity !== "" && quantity < 1) {
            return "You must offer at least 1";
        } else if (quantity > 1000) {
            return "Maximum quantity is 1000";
        } else {
            return null;
        }
    };

    const priceValidator = (price) => {
        if (price != "" && price < 1) {
            return "Minimum price is 1 NEAR";
        } else if (price > 1000000) {
            return "Price is too high";
        } else {
            return null;
        }
    };

    const [quantityError, setQuantityError] = useState(quantityValidator(quantity));
    const [priceError, setPriceError] = React.useState(priceValidator(price));

    return (
        <>
            <p style={{ fontSize: "12px", opacity: "65%", marginBlockStart: "40px", marginBlockEnd: "12px" }}>Number of tokens offered:</p>
            <QuantityInput
                initialQuantity={quantity}
                error={quantityError}
                onChange={(quantity) => {
                    setQuantityError(quantityValidator(quantity));
                    onQuantityChange(quantity);
                }} />
            <p style={{ fontSize: "12px", opacity: "65%", marginBlockStart: "40px", marginBlockEnd: "12px" }}>Token price (Near):</p>
            <PriceInput
                initialPrice={price}
                error={priceError}
                onChange={(price) => {
                    setPriceError(priceValidator(price));
                    onPriceChange(price);
                }} />
            <p>
                <button style={{ position: "absolute", left: "64px", bottom: "24px" }} onClick={onPrev}>PREV</button>
                {
                    !quantityError && quantity > 0 && !priceError && price > 0 ?
                        <button style={{ position: "absolute", right: "64px", bottom: "24px" }} onClick={onNext}>NEXT</button> :
                        <button disabled style={{ position: "absolute", right: "64px", bottom: "24px" }} onClick={onNext}>NEXT</button>
                }
            </p>
        </>
    );
}

function Preview({ title, imageUrl, songLink, quantity, price, onPrev, onSubmit }) {
    return (
        <>
            <p style={{ fontSize: "12px", opacity: "65%", marginBlockStart: "40px", marginBlockEnd: "12px" }}>You are just about to submit the NFT listing:</p>
            <p>{title}</p>
            <IpfsImage
                initialUrl={imageUrl}
            />
            <div style={{ marginTop: "24px" }}>
                <SpotifyLink
                    initialLink={songLink}
                />
            </div>
            <p>Listing {quantity} NFTs for {price} NEAR each</p>
            <button style={{ position: "absolute", left: "64px", bottom: "24px" }} onClick={onPrev}>PREV</button>
            <button style={{ position: "absolute", right: "64px", bottom: "24px" }} onClick={onSubmit}>SUBMIT</button>
        </>
    );
}

function TitleInput({ title, error, onChange }) {
    if (error !== null) {
        return (
            <>
                <TextField
                    fullWidth
                    error
                    required
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
                    fullWidth
                    required
                    onChange={(e) => onChange(e.target.value)}
                    defaultValue={title}
                    autoComplete="off"
                />
            </>
        );
    }
}


function QuantityInput({ initialQuantity, error, onChange }) {

    const [quantity, setQuantity] = useState(initialQuantity);

    const validator = (text) => {
        const onlyDigits = text.match('([0-9]{0,4})')[0];
        const number = Number(onlyDigits);
        setQuantity(number);
        onChange(number.toString());
    };

    return (
        <>
            <TextField
                error={error !== null}
                required
                helperText={error}
                onChange={(e) => validator(e.target.value)}
                pattern="[0-9!]"
                value={quantity}
                autoComplete="off"
            />
        </>
    );
}

function PriceInput({ initialPrice, error, onChange }) {
    const [price, setPrice] = useState(initialPrice);

    const validator = (text) => {
        const onlyDigitsAndPoint = text.match('([0-9]*)[.]?([0-9]?)')[0];
        setPrice(onlyDigitsAndPoint);
        onChange(onlyDigitsAndPoint.toString());
    };

    return (
        <>
            <TextField
                error={error !== null}
                required
                helperText={error}
                onChange={(e) => validator(e.target.value)}
                value={price}
                autoComplete="off"
            />
        </>
    );
}
