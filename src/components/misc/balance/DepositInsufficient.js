import { useState } from 'react';
import { useEneftigoContext } from 'EneftigoContext';
import { yocto_to_near } from "helpers";
import { DEPOSIT_MIN_YOCTO, DEPOSIT_LOW_YOCTO } from "constants";
import { DepositAdd } from './DepositAdd';
import { EneftigoModal } from 'EneftigoModal';
import { DepositInfo } from './DepositInfo';
import near_icon from 'assets/near_icon_dark.png';
import icon_ok from 'assets/ok.png'
import icon_warning from 'assets/warning.png'
import icon_stop from 'assets/stop.png'

const Modal = {
    DEPOSIT_INFO: 0,
    DEPOSIT_ADD: 1,
};

export function DepositInsufficient({ open, handleClose }) {
    const [modal, setModal] = useState(null);

    const content =
        <div style={{ margin: "16px 32px 32px 32px" }}>
            <DepositInsufficientContent
                handleAddDeposit={() => setModal(Modal.DEPOSIT_ADD)}
            />
        </div>;

    return (
        <>
            <EneftigoModal
                open={open && (modal === null || modal === Modal.DEPOSIT_INFO)}
                title={"INSUFFICIENT STORAGE DEPOSIT"}
                handleHelp={() => setModal(Modal.DEPOSIT_INFO)}
                handleClose={handleClose}
                content={content}
            />
            <DepositInfo
                open={modal === Modal.DEPOSIT_INFO}
                handleClose={() => setModal(null)}
            />
            <DepositAdd
                open={modal === Modal.DEPOSIT_ADD}
                handleClose={() => {
                    setModal(null);
                    handleClose();
                }}
            />
        </>
    );
}

function DepositInsufficientContent({ handleAddDeposit, handleWithdrawDeposit, priceToPayYocto }) {
    const { deposit } = useEneftigoContext();

    let depositColor;
    if (deposit[0] < DEPOSIT_MIN_YOCTO) {
        depositColor = "var(--eneftigo-red)";
    } else if (deposit[0] < DEPOSIT_LOW_YOCTO) {
        depositColor = "var(--eneftigo-yellow)";
    } else {
        depositColor = "var(--eneftigo-green)";
    }

    return (
        <>
            <p style={{ textAlign: 'center', marginBlockEnd: '0' }} id="buy-modal-description">
                Storage Deposit:
            </p>
            <div className="flex-container">
                <h2 style={{ color: depositColor }}>
                    {((yocto_to_near(deposit[0])) * 1).toFixed(2)}
                </h2>
                <img src={near_icon} width="36" height="36" alt="N" />
            </div>
            <div style={{ textAlign: 'center', fontSize: 'var(--eneftigo-font-size-small)' }}>
                {
                    deposit[0] < DEPOSIT_MIN_YOCTO ?
                        <div className="flex-container" style={{ justifyContent: 'left' }}>
                            <img style={{ marginRight: '10px' }} src={icon_stop} width="30px" height="30px" />
                            <p style={{ margin: '0', textAlign: 'left' }}>Your storage deposit level is critically low.<br />You won't be able to make any transactions unless you place additional deposit.</p>
                        </div> :
                        (deposit[0] < DEPOSIT_LOW_YOCTO ?
                            <div className="flex-container" style={{ justifyContent: 'left' }}>
                                <img style={{ marginRight: '10px' }} src={icon_warning} width="30px" height="30px" />
                                <p style={{ margin: '0', textAlign: 'left' }}>You storage deposit is running low. You can still make transactions<br />but it won't hurt to charge now.</p>
                            </div> :
                            <div className="flex-container" style={{ justifyContent: 'left' }}>
                                <img style={{ marginRight: '10px' }} src={icon_ok} width="30px" height="30px" />
                                <p style={{ margin: '0', textAlign: 'left' }}>Your storage deposit level is sufficient to make transactions.<br />You can add or withdraw your deposit anytime.</p>
                            </div>)
                }
            </div>

            <div className="flex-container" style={{ margin: '16px', justifyContent: "space-around" }}>
                <button
                    style={{ width: "100px" }}
                    onClick={handleAddDeposit}
                >
                    ADD DEPOSIT
                </button>
            </div>
        </>
    );
}
