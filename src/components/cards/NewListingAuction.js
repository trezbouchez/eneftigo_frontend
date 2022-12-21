import React from 'react';

import { Card, FormGroup, FormControlLabel } from '@mui/material'
import { Stepper, Step, StepLabel, Button, Checkbox } from '@mui/material'
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import MenuItem from '@mui/material/MenuItem';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { BounceLoader } from 'react-spinners';
import { toast } from "react-hot-toast";
import nft_media_placeholder from 'assets/nft_media_placeholder.png';
import plus_icon from 'assets/plus_icon.png';
import { storeImage } from 'nftStorage';
import { useEneftigoContext } from 'EneftigoContext';
import { getStorageDeposit, viewAccount, addPrimaryListing } from 'nearInterface';
import { validateDate } from '@mui/x-date-pickers/internals/hooks/validation/useDateValidation';
import { duration } from 'moment';

const StartOptions = [
    "Now",
    "In 1 Hour",
    "In 1 Day",
    "In 3 Days",
    "In 1 Week"
];

const DefaultDurationOptionIndex = 2;
const DurationOptions = [
    "1 Day",
    "3 Days",
    "1 Week",
    "2 Weeks",
    "1 Month (30 Days)"
];

const steps = [
    'General',
    'Asset',
    'Quantity',
    'Pricing',
    'Timing',
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

async function submitListing({ selector, contractId, account, title, imageUrl, auxAudioUrl, quantity, minBidNear, startDate, endDate }) {
    let minBidYocto = minBidNear ? (BigInt(parseInt(minBidNear)) * 10n ** 24n).toString() : null;
    const result = await addPrimaryListing({
        selector,
        contractId,
        accountId: account.account_id,
        title,
        imageUrl,
        auxAudioUrl,
        supplyTotal: quantity,
        minBidYocto,
        startDate,
        endDate
    });
    return result;
}

export default function CreateAuctionListing() {
    const [step, setStep] = React.useState(0);
    const { selector, contractId, account, setAccount, setDeposit } = useEneftigoContext();

    const handleSubmit = ({ title, imageUrl, auxAudioUrl, quantity, minBidNear, startOption, durationOption }) => {
        let startDate;
        switch (startOption) {
            case 0: startDate = null; break;  // now
            case 1: startDate = new Date(Date.now() + 1 * 1 * 60 * 60 * 1000); break;  // in 1 hour
            case 2: startDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); break;  // in 1 day
            case 3: startDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); break;  // in 3 days
            case 4: startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); break;  // in 1 week
        }
        let endTime;
        let startTime = startDate?.getTime() ?? Date.now();
        switch (durationOption) {
            case 0: endTime = startTime + 1 * 24 * 60 * 60 * 1000; break;  // 1 day
            case 1: endTime = startTime + 3 * 24 * 60 * 60 * 1000; break;  // 3 days
            case 2: endTime = startTime + 7 * 24 * 60 * 60 * 1000; break;  // 1 week
            case 3: endTime = startTime + 14 * 24 * 60 * 60 * 1000; break;  // 2 weeks
            case 4: endTime = startTime + 30 * 24 * 60 * 60 * 1000; break;  // 1 month (30 days)
        }
        const endDate = new Date(endTime);
        const promiseChain = submitListing({
            selector: selector,
            contractId: contractId,
            account: account,
            title: title,
            imageUrl: imageUrl,
            auxAudioUrl: auxAudioUrl,
            quantity: quantity,
            minBidNear: minBidNear,
            startDate: startDate,
            endDate: endDate,
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
        <div style={{ textAlign: "center", position: "relative", marginLeft: "auto", marginRight: "auto", borderRadius: 3, p: 1, height: "450px", width: "600px" }}>
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
    );
}

function CreatePage({ step, onPrev, onNext, onSubmit }) {

    const [title, setTitle] = React.useState("");
    const [imageUrl, setImageUrl] = React.useState("");
    const [auxAudioUrl, setAuxAudioUrl] = React.useState("");
    const [quantity, setQuantity] = React.useState("");
    const [minBid, setMinBid] = React.useState("");
    const [startOption, setStartOption] = React.useState(0);
    const [durationOption, setDurationOption] = React.useState(DefaultDurationOptionIndex);

    switch (step) {
        case 0:
            return (
                <>
                    <Basic
                        title={title}
                        onTitleChange={(title) => setTitle(title)}
                        onNext={onNext}
                    />
                </>
            );
        case 1:
            return (
                <>
                    <Image
                        url={imageUrl}
                        onUrlChange={(url) => setImageUrl(url)}
                        onPrev={onPrev}
                        onNext={onNext}
                    />
                </>
            );
        case 2:
            return (
                <>
                    <Quantity
                        quantity={quantity}
                        onQuantityChange={(quantity) => setQuantity(quantity)}
                        onPrev={onPrev}
                        onNext={onNext}
                    />
                </>
            );
        case 3:
            return (
                <>
                    <Pricing
                        minBid={minBid}
                        onMinBidChange={(newMinBid) => setMinBid(newMinBid)}
                        onPrev={onPrev}
                        onNext={onNext}
                    />
                </>
            );
        case 4:
            return (
                <>
                    <Timing
                        startOption={startOption}
                        onStartOptionChanged={(newStartOption) => setStartOption(newStartOption)}
                        durationOption={durationOption}
                        onDurationOptionChanged={(newDurationOption) => setDurationOption(newDurationOption)}
                        onPrev={onPrev}
                        onNext={onNext}
                    />
                </>
            );
        case 5:

            return (<>
                <Preview
                    title={title}
                    image={imageUrl}
                    auxAudioUrl={auxAudioUrl}
                    quantity={quantity}
                    minBid={minBid}
                    startOption={startOption}
                    durationOption={durationOption}
                    onPrev={onPrev}
                    onSubmit={(e) => onSubmit(
                        {
                            title: title,
                            imageUrl: imageUrl,
                            auxAudioUrl: auxAudioUrl,
                            quantity: quantity,
                            minBidNear: minBid,
                            startOption: startOption,
                            durationOption: durationOption,
                        }
                    )}
                />
            </>
            );
    }
}

function Basic({ title, onTitleChange, onNext }) {

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
        <div style={{}}>
            <p style={{ margin: "24px" }}>Your NFT auction needs a title</p>
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
        </div>
    );
}

function Image({ url, onUrlChange, onPrev, onNext }) {
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

function Quantity({ quantity, onQuantityChange, onPrev, onNext }) {

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

function Pricing({ minBid, onMinBidChange, onPrev, onNext }) {

    const minBidValidator = (newMinBid) => {
        if (newMinBid != "" && newMinBid < 1) {
            return "Minimum bid is 1 NEAR";
        } else if (newMinBid > 1000000) {
            return "Min bid amount is too high";
        } else {
            return null;
        }
    };

    const [minBidError, setMinBidError] = React.useState(minBidValidator(minBid));

    return (
        <>
            <p style={{ margin: "24px" }}>What's the minimum bid amount (per item)?</p>
            <BidInput
                bid={minBid}
                error={minBidError}
                onChange={(newMinBid) => {
                    setMinBidError(minBidValidator(newMinBid));
                    onMinBidChange(newMinBid);
                }} />
            <p>
                <button style={{ position: "absolute", left: "64px", bottom: "24px" }} onClick={onPrev}>PREV</button>
                {minBidError === null && minBid > 0 ?
                    <button style={{ position: "absolute", right: "64px", bottom: "24px" }} onClick={onNext}>NEXT</button> :
                    <button disabled style={{ position: "absolute", right: "64px", bottom: "24px" }} onClick={onNext}>NEXT</button>
                }
            </p>
        </>
    );
}


function Timing({ startOption, onStartOptionChanged, durationOption, onDurationOptionChanged, onPrev, onNext }) {

    const handleStartOptionChanged = (e) => {
        onStartOptionChanged(e.target.value);
    };

    const handleDurationOptionChanged = (e) => {
        onDurationOptionChanged(e.target.value);
    };

    // const [startDateError, setStartDateError] = React.useState(startDateValidator(startDate));
    // const [durationError, setDurationError] = React.useState(durationValidator(duration));

    return (
        <>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <p style={{ margin: "24px" }}>Specify your auction beginning and duration</p>
                <p>START:</p>
                <Select
                    labelId="auction-start-label"
                    id="auction-start"
                    value={startOption}
                    onChange={handleStartOptionChanged}
                    style={{ width: "200px", fontFamily:"var(--eneftigo-header-font-family)", fontSize:"12px" }}
                >
                    {
                        Array.from({ length: StartOptions.length }, (v, k) => k).map((index) => <MenuItem
                            key={index}
                            value={index}
                        >
                            {StartOptions[index]}
                        </MenuItem>)
                    }
                </Select>

                {/* <div style={{ display: "flex", justifyContent: "space-evenly" }}>
                    <div style={{ width: "20%" }} />
                    <DesktopDatePicker
                        inputFormat="dd MMM yyyy"
                        value={startDate ?? new Date()}
                        disabled={startDate === null}
                        onChange={handleStartDateChanged}
                        disableMaskedInput
                        renderInput={(params) => <TextField {...params} />}
                        style={{ width: "200px" }}
                    />
                    <FormGroup style={{ width: "20%" }}>
                        <FormControlLabel
                            control={<Checkbox
                                checked={startDate === null}
                                onChange={handleImmediatelyChanged}
                            />}
                            label="Immediately"
                        />
                    </FormGroup>
                </div> */}

                <p>DURATION:</p>
                <Select
                    labelId="auction-duration-label"
                    id="auction-duration"
                    value={durationOption}
                    onChange={handleDurationOptionChanged}
                    style={{ width: "200px", fontFamily:"var(--eneftigo-header-font-family)", fontSize:"12px" }}
                >
                    {
                        Array.from({ length: DurationOptions.length }, (v, k) => k).map((index) =>
                            <MenuItem
                                key={index}
                                value={index}
                            >
                                {DurationOptions[index]}
                            </MenuItem>
                        )
                    }
                </Select>
                <p>
                    <button style={{ position: "absolute", left: "64px", bottom: "24px" }} onClick={onPrev}>PREV</button>
                    <button style={{ position: "absolute", right: "64px", bottom: "24px" }} onClick={onNext}>PREVIEW</button>
                </p>
            </LocalizationProvider>
        </>
    );
}

function Preview({ title, imageUrl, auxAudioUrl, quantity, minBid, onPrev, onSubmit }) {
    return (
        <>
            <p>You are just about to submit the NFT auction:</p>
            <p>{title}</p>
            <img
                src={imageUrl}
                width="200"
                height="200"
                alt="MEDIA"
            />
            <p>Offering {quantity} NFTs from {minBid} NEAR up</p>
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
                    // className={this.props.}
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
                    required
                    onChange={(e) => onChange(e.target.value)}
                    defaultValue={title}
                    placeholder="auction title"
                    autoComplete="off"
                    sx={{ borderColor: "white", textAlign: "center" }}
                />
            </>
        );
    }
}

function BidInput({ bid, error, onChange }) {
    if (error !== null) {
        return (
            <>
                <TextField
                    error
                    required
                    type="number"
                    helperText={error}
                    onChange={(e) => onChange(e.target.value)}
                    defaultValue={bid}
                    autoComplete="off"
                />
            </>
        );
    } else {
        return (
            <>
                <TextField
                    required
                    type="number"
                    onChange={(e) => onChange(e.target.value)}
                    defaultValue={bid}
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
