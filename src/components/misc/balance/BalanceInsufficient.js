import { useState } from 'react';
import { useEneftigoContext } from 'EneftigoContext';
import { yocto_to_near } from "helpers";
import { BALANCE_MIN_YOCTO, BALANCE_LOW_YOCTO } from "constants";
import { EneftigoModal } from 'EneftigoModal';
import { BalanceInfo } from './BalanceInfo';
import near_icon from 'assets/near_icon_dark.png';
import icon_ok from 'assets/ok.png'
import icon_warning from 'assets/warning.png'
import icon_stop from 'assets/stop.png'

const Modal = {
    INFO: 0,
};

export function BalanceInsufficient({ open, handleClose, priceToPayYocto = null }) {
    const [modal, setModal] = useState(null);

    const content =
        <div style={{ margin: "16px 32px 32px 32px" }}>
            <BalanceInsufficientContent
                priceToPayYocto={priceToPayYocto}
            />
        </div>;

    return (
        <>
            <EneftigoModal
                open={open && (modal === null || modal === Modal.INFO)}
                title="INSUFFICIENT BALANCE"
                handleHelp={() => setModal(Modal.INFO)}
                handleClose={handleClose}
                content={content}
            />
            <BalanceInfo
                open={modal === Modal.INFO}
                handleClose={() => setModal(null)}
            />
        </>
    );
}

function BalanceInsufficientContent({ priceToPayYocto }) {
    const { account } = useEneftigoContext();

    const minBalanceRequired = BALANCE_MIN_YOCTO + (BigInt(priceToPayYocto ?? 0));
    let balanceColor;
    if (account.amount < minBalanceRequired) {
        balanceColor = "var(--eneftigo-red)";
    } else if (account.amount < BALANCE_LOW_YOCTO) {
        balanceColor = "var(--eneftigo-yellow)";
    } else {
        balanceColor = "var(--eneftigo-green)";
    }

    return (
        <>
            <p style={{ textAlign: 'center', marginBlockEnd: '0' }} id="buy-modal-description">
                Wallet Balance:
            </p>
            <div className="flex-container" style={{ marginBlockStart: "0" }}>
                <h2 style={{ color: balanceColor }}>
                    {yocto_to_near(BigInt(account.amount)).toFixed(2)}
                </h2>
                <img src={near_icon} width="36" height="36" alt="N" />
            </div>
            <div style={{ textAlign: 'center', fontSize: 'var(--eneftigo-font-size-small)' }}>
                {
                    account.amount < minBalanceRequired ?
                        <div className="flex-container" style={{ justifyContent: 'left' }}>
                            <img style={{ marginRight: '10px' }} src={icon_stop} width="30px" height="30px" />
                            {priceToPayYocto === null ?
                                <>
                                    <p style={{ margin: '0', textAlign: 'left' }}>
                                        Your balance is critically low.<br />
                                        You won't be able to make any transactions unless you by some NEAR.
                                    </p>
                                </> :
                                <>
                                    <p style={{ margin: '0', textAlign: 'left' }}>
                                        Your balance is too low to pay the price of {yocto_to_near(BigInt(priceToPayYocto))} NEAR and cover<br />
                                        gas fees (less than {yocto_to_near(BALANCE_MIN_YOCTO, 5)}). Please buy some NEAR and try again.
                                    </p>
                                </>
                            }
                        </div> :
                        (account.amount < BALANCE_LOW_YOCTO ?
                            <div className="flex-container" style={{ justifyContent: 'left' }}>
                                <img style={{ marginRight: '10px' }} src={icon_warning} width="30px" height="30px" />
                                <p style={{ margin: '0', textAlign: 'left' }}>
                                    You balance is running low. You can still make transactions but we recommend<br />
                                    that you buy some more NEAR to be able to pay transaction (gas) fees.
                                </p>
                            </div> :
                            <div className="flex-container" style={{ justifyContent: 'left' }}>
                                <img style={{ marginRight: '10px' }} src={icon_ok} width="30px" height="30px" />
                                <p style={{ margin: '0', textAlign: 'left' }}>
                                    Your balance is sufficient to make transactions and pay gas fees.
                                </p>
                            </div>)
                }
            </div>
        </>
    );
}
