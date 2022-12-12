import { useEneftigoContext } from "EneftigoContext";
import { useState } from "react";
import { DEPOSIT_MIN_YOCTO, DEPOSIT_LOW_YOCTO, BALANCE_MIN_YOCTO, BALANCE_LOW_YOCTO } from "constants";
import { yocto_to_near } from "helpers";
import { BalanceDetails } from 'components/misc/balance/BalanceDetails';
import { Tooltip } from "@mui/material";
import { Zoom } from '@mui/material';
import near_icon from 'assets/near_icon_light.png';
import icon_warning from 'assets/warning.png'
import icon_stop from 'assets/stop.png'

const ModalChild = {
    DETAILS: 0,
};

export function Balance() {
    const { account, deposit } = useEneftigoContext();
    const [modal, setModal] = useState(null);

    const handleShowDetails = () => {
        setModal(ModalChild.DETAILS);
    };

    const handleHideModal = () => {
        setModal(null);
    };

    const balanceNear = yocto_to_near(BigInt(account.amount)).toFixed(2);
    let balanceColor;
    if (account.amount < BALANCE_MIN_YOCTO) {
        balanceColor = "var(--eneftigo-red)";
    } else if (account.amount < BALANCE_LOW_YOCTO) {
        balanceColor = "var(--eneftigo-yellow)";
    } else {
        balanceColor = "var(--eneftigo-white)";
    }

    const depositNear = yocto_to_near(deposit[0]).toFixed(2);
    let depositColor;
    if (deposit[0] < DEPOSIT_MIN_YOCTO) {
        depositColor = "var(--eneftigo-red)";
    } else if (deposit[0] < DEPOSIT_LOW_YOCTO) {
        depositColor = "var(--eneftigo-yellow)";
    } else {
        depositColor = "var(--eneftigo-white)";
    }

    return (
        <div className="flex-container">
            <Tooltip
                title={"Wallet balance: " + balanceNear + ", Storage deposit: " + depositNear}
                TransitionComponent={Zoom}
                arrow
            >
                <p onClick={handleShowDetails}>
                    <span style={{ fontFamily: "var(--eneftigo-mono-font-family", fontSize:"18px", color: balanceColor }}
                    >
                        {account.amount < BALANCE_MIN_YOCTO ?
                            <img style={{ marginTop: "1px", marginBottom: "-1px", marginRight: "2px" }} src={icon_stop} width="13" height="13" alt="stop" /> :
                            (account.amount < BALANCE_LOW_YOCTO &&
                                <img style={{ marginTop: "1px", marginBottom: "-1px", marginRight: "2px" }} src={icon_warning} width="13" height="13" alt="!" />)
                        }
                        {balanceNear}
                    </span>
                    <span
                        style={{ fontFamily: "var(--eneftigo-mono-font-family", fontSize:"18px", color: depositColor }}
                    > (
                        {deposit[0] < DEPOSIT_MIN_YOCTO ?
                            <img style={{ marginTop: "1px", marginBottom: "-1px", marginRight: "2px" }} src={icon_stop} width="13" height="13" alt="stop" /> :
                            (deposit[0] < DEPOSIT_LOW_YOCTO &&
                                <img style={{ marginTop: "1px", marginBottom: "-1px", marginRight: "2px" }} src={icon_warning} width="13" height="13" alt="!" />)
                        }
                        {depositNear}
                        )
                    </span>
                </p>
            </Tooltip>
            <img onClick={handleShowDetails} src={near_icon} width="30" height="30" alt="N" />
            <BalanceDetails
                open={modal === ModalChild.DETAILS}
                handleClose={handleHideModal}
            />
        </div>
    );
}
