import { useEneftigoContext } from 'EneftigoContext';
import { useState } from 'react';
import { DEPOSIT_MIN_YOCTO, BALANCE_MIN_YOCTO } from 'constants';
import { BidDetails } from './BidDetails.js';
import { BalanceInsufficient } from 'components/misc/balance/BalanceInsufficient';
import { DepositInsufficient } from 'components/misc/balance/DepositInsufficient';

const Modal = {
    BID: 0,
    INSUFFICIENT_DEPOSIT: 2,
};

export function Bid({ listing, bidAmount }) {
    const { account, deposit } = useEneftigoContext();
    const [modal, setModal] = useState(null);

    const depositSufficient = deposit[0] >= DEPOSIT_MIN_YOCTO;

    const handleOpen = () => {
        if (!depositSufficient) {
            setModal(Modal.INSUFFICIENT_DEPOSIT);
        } else {
            setModal(Modal.BID);
        }
    };

    return (
        <>
            <button style={{ width: "60px" }} className="listing_buy_thumb" onClick={handleOpen}>
                BID
            </button>
            <BidDetails
                listing={listing}
                bidAmount={bidAmount}
                open={modal === Modal.BID}
                handleClose={() => setModal(null)}
            />
            <DepositInsufficient
                open={modal === Modal.INSUFFICIENT_DEPOSIT}
                handleClose={() => setModal(null)}
            />
        </>
    );
}
