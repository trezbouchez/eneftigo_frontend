import { useEneftigoContext } from "EneftigoContext";
import { useState } from "react";
import { FormGroup, FormControlLabel, TextField, InputAdornment, Checkbox } from '@mui/material';
import { getStorageDeposit, viewAccount, withdrawStorageDeposit } from "nearInterface";
import { PuffLoader } from 'react-spinners';
import near_icon from 'assets/near_icon_dark.png';
import { near_to_yocto, yocto_to_near } from "helpers";
import { toast } from "react-hot-toast";
import { EneftigoModal } from 'EneftigoModal';
import { DepositInfo } from 'components/misc/balance/DepositInfo';

const Modal = {
    DEPOSIT_INFO: 0,
};

export function DepositWithdraw({ open, handleClose }) {
    const [modal, setModal] = useState(null);

    const content =
        <div style={{ margin: "16px 32px 32px 32px" }}>
            <DepositWithdrawContent
                handleClose={handleClose}
            />
        </div>;

    return (
        <>
            <EneftigoModal
                open={open && (modal === null || modal === Modal.DEPOSIT_INFO)}
                title="WITHDRAW DEPOSIT"
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

function DepositWithdrawContent({ handleClose }) {
    const { selector, contractId, account, deposit, setAccount, setDeposit } = useEneftigoContext();
    const [busy, setBusy] = useState(false);
    const [amountError, setAmountError] = useState(null);
    const [withdrawAll, setWithdrawAll] = useState(false);
    const [userAmount, setUserAmount] = useState(0)     // yocto
    const [amount, setAmount] = useState(0);            // yocto

    const maxAmountNearRounded = Math.max(0, Math.round(yocto_to_near(deposit[0]) * 10 ** 2) / 10 ** 2);

    const amountValidator = (amountNear) => {
        if (isNaN(amountNear)) {
            return "enter a number"
        } else {
            if (amountNear > maxAmountNearRounded) {
                return "maximum amount is " + maxAmountNearRounded;
            } else {
                return null;
            }
        }
    };

    const handleAmountChange = (amountNear) => {
        setAmountError(amountValidator(amountNear));
        if (!withdrawAll) {
            setUserAmount(amountNear);
        }
        setAmount(amountNear);
    };

    const handleWithdrawAll = (wantWithdrawAll) => {
        setWithdrawAll(wantWithdrawAll);
        if (wantWithdrawAll) {
            setAmount(maxAmountNearRounded);
            setAmountError(null);
        } else {
            setAmount(userAmount);
            setAmountError(amountValidator(userAmount));
        }
    };

    const handleSubmit = async () => {
        var amountYocto;
        if (withdrawAll) {
            amountYocto = deposit[0];
        } else {
            const userAmountYocto = near_to_yocto(amount);
            amountYocto = deposit[0] > userAmountYocto ? userAmountYocto : deposit[0];
        }

        const promiseChain = withdrawStorageDeposit({
            selector: selector,
            contractId: contractId,
            accountId: account.account_id,
            amountYocto: amountYocto,
        }).then(() => {
            return Promise.all([
                getStorageDeposit({
                    selector: selector,
                    contractId: contractId,
                    accountId: account.account_id,
                }).then((updatedDeposit) => {
                    setDeposit(updatedDeposit)
                }),
                viewAccount({
                    selector: selector,
                    accountId: account.account_id,
                }).then((updatedAccountData) => {
                    console.log("updated balance " + updatedAccountData.amount)
                    const updatedAccount = {
                        account_id: account.account_id,
                        ...updatedAccountData,
                    };
                    setAccount(updatedAccount);
                })
            ]);
        });

        toast.promise(
            promiseChain,
            {
                loading: 'Withdrawing deposit...',
                success: <b>Deposit withdrawed!</b>,
                error: <b>Failed to withdraw deposit.</b>,
            }
        );
        handleClose();
    };

    return (
        <div>

            <p>How much would you like to withdraw?</p>
            <FormGroup>
                <FormControlLabel
                    control={<Checkbox
                        onChange={(e) => handleWithdrawAll(e.target.checked)}
                        checked={withdrawAll}
                    />}
                    label={"ALL (" + maxAmountNearRounded + " NEAR)"} />
            </FormGroup>
            <div className="flex-container" style={{ margin: '16px', justifyContent: "space-evenly" }}>
                <TextField
                    style={{ marginBlockStart: "24px", marginBlockEnd: "36px" }}
                    required
                    type="text"
                    label={amountError ?? "amount"}
                    error={amountError !== null}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    // pattern="[0-9]*"
                    value={amount}
                    disabled={withdrawAll}
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
                <button onClick={handleSubmit} disabled={amountError !== null} style={{ width: "100px" }} >WITHDRAW DEPOSIT</button>
            </div>
            {busy &&
                <div><PuffLoader color="#DD3333" style={{ position: "absolute", top: "35%", left: "45%" }} /></div>
            }
        </div >
    );
}
