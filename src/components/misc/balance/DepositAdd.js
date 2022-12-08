import { useEneftigoContext } from "EneftigoContext";
import { useState } from "react";
import { Radio, RadioGroup, FormControlLabel, TextField, InputAdornment } from '@mui/material';
import near_icon from 'assets/near_icon_dark.png';
import { DEPOSIT_LOW_YOCTO, DEPOSIT_RECOMMENDED_YOCTO } from "constants";
import { near_to_yocto, yocto_to_near } from 'helpers';
import { viewAccount, getStorageDeposit, addStorageDeposit } from "nearInterface";
import { PuffLoader } from 'react-spinners';
import { toast } from "react-hot-toast";
import { EneftigoModal } from 'EneftigoModal';
import { DepositInfo } from 'components/misc/balance/DepositInfo';

const AmountOption = {
    MINIMUM: "minimum",
    RECOMMENDED: "recommended",
    OTHER: "other",
};

const Modal = {
    DEPOSIT_INFO: 0,
};

export function DepositAdd({ open, handleClose }) {
    const [modal, setModal] = useState(null);

    const content =
        <div style={{ margin: "16px 32px 32px 32px" }}>
            <DepositAddContent
                handleClose={handleClose}
            />
        </div>;

    return (
        <>
            <EneftigoModal
                open={open && (modal === null || modal === Modal.DEPOSIT_INFO)}
                title="ADD DEPOSIT"
                handleHelp={() => setModal(Modal.DEPOSIT_INFO)}
                handleClose={handleClose}
                content={content}
            />
            <DepositInfo
                open={modal === Modal.DEPOSIT_INFO}
                handleClose={() => setModal(null)}
            />
        </>
    );
}

function DepositAddContent({ handleClose }) {
    const { selector, contractId, account, deposit, setAccount, setDeposit } = useEneftigoContext();
    const [busy, setBusy] = useState(false);
    const [amountError, setAmountError] = useState(null);

    const minAmountNear = Math.max(0.1, Math.ceil(yocto_to_near(DEPOSIT_LOW_YOCTO - deposit[0]) * 10 ** 2) / 10 ** 2);
    const recommendedAmountNear = Math.max(0, Math.ceil(yocto_to_near(DEPOSIT_RECOMMENDED_YOCTO - deposit[0]) * 10 ** 2) / 10 ** 2);
    const showAmountOptions = deposit[0] < DEPOSIT_LOW_YOCTO;

    const [amountOption, setAmountOption] = useState(showAmountOptions ? AmountOption.RECOMMENDED : AmountOption.OTHER);
    const [userAmount, setUserAmount] = useState(recommendedAmountNear)
    const [amount, setAmount] = useState(recommendedAmountNear);

    const amountValidator = (amountNear) => {
        if (isNaN(amountNear)) {
            return "enter a number"
        } else if (amountNear < minAmountNear) {
            return "minimum amount is " + minAmountNear
        } else if (amountNear > account.amount) {
            return "insufficient funds"
        } else {
            return null;
        }
    };

    const handleAmountChange = (amountNear) => {
        if (amountOption === AmountOption.OTHER) {
            setUserAmount(amountNear);
        }
        setAmount(amountNear);
        setAmountError(amountValidator(amountNear));
    };

    const handleAmountOption = (amountOption) => {
        setAmountOption(amountOption);
        if (amountOption === AmountOption.MINIMUM) {
            setAmount(minAmountNear);
        } else if (amountOption === AmountOption.RECOMMENDED) {
            setAmount(recommendedAmountNear);
        } else {
            setAmount(userAmount);
        }
    };

    const handleSubmit = async () => {
        const promiseChain = addStorageDeposit({
            selector: selector,
            contractId: contractId,
            accountId: account.account_id,
            depositYocto: near_to_yocto(amount),
        }).then(() => {
            return Promise.all([
                getStorageDeposit({
                    selector: selector,
                    contractId: contractId,
                    accountId: account.account_id,
                }).then((updatedDeposit) => {
                    setDeposit(updatedDeposit);
                    const newRecommendedAmountNear = Math.max(0, Math.ceil(yocto_to_near(DEPOSIT_RECOMMENDED_YOCTO - updatedDeposit[0]) * 10 ** 2) / 10 ** 2);
                    const showAmountOptions = updatedDeposit[0] < DEPOSIT_LOW_YOCTO;
                    setAmountOption(showAmountOptions ? AmountOption.RECOMMENDED : AmountOption.OTHER);
                    setAmount(newRecommendedAmountNear);
                    setUserAmount(newRecommendedAmountNear);
                }),
                viewAccount({
                    selector: selector,
                    accountId: account.account_id,
                }).then((updatedAccountData) => {
                    const updatedAccount = {
                        account_id: account.account_id,
                        ...updatedAccountData,
                    };
                    setAccount(updatedAccount);
                })
            ]);
        });

        toast('Redirecting to wallet...', {
            icon: '👛'
        });

        handleClose();
    };

    return (
        <div>
            <p>How much deposit would you like to add?</p>
            {showAmountOptions &&
                <RadioGroup
                    defaultValue={AmountOption.RECOMMENDED}
                    aria-labelledby="demo-radio-buttons-group-label"
                    name="radio-buttons-group"
                    onChange={(e) => handleAmountOption(e.target.value)}
                >
                    <FormControlLabel value={AmountOption.MINIMUM} control={<Radio />} label={minAmountNear + " NEAR (minimum)"} />
                    <FormControlLabel value={AmountOption.RECOMMENDED} control={<Radio />} label={recommendedAmountNear + " NEAR (recommended)"} />
                    <FormControlLabel value={AmountOption.OTHER} control={<Radio />} label="OTHER" />
                </RadioGroup>
            }
            <div className="flex-container" style={{ margin: '16px', justifyContent: "space-evenly" }}>
                <TextField
                    style={{ marginBlockStart: "24px", marginBlockEnd: "36px" }}
                    required
                    type="text"
                    label={amountError ?? "amount"}
                    error={amountError !== null}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    // pattern="[0-9]*"
                    value={amountOption === AmountOption.MINIMUM ? minAmountNear :
                        (amountOption === AmountOption.RECOMMENDED ? recommendedAmountNear : userAmount)}
                    disabled={amountOption !== AmountOption.OTHER}
                    autoComplete="off"
                    inputMode='numeric'
                    InputProps={{
                        pattern: '[0-9]*',
                        inputMode: 'numeric',
                        endAdornment: (
                            <InputAdornment position="start">
                                <img src={near_icon} width="30" height="30" alt="N" />
                            </InputAdornment>
                        ),
                    }}
                />
            </div>
            <div className="flex-container" style={{ margin: '16px', justifyContent: "space-evenly" }}>
                <button onClick={handleSubmit} disabled={amountError !== null} style={{ width: "100px" }} >ADD DEPOSIT</button>
            </div>
            {busy &&
                <div><PuffLoader color="#DD3333" style={{ position: "absolute", top: "35%", left: "45%" }} /></div>
            }
        </div >
    );
}
