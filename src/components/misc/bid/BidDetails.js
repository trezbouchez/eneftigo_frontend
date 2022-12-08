import { useEneftigoContext } from 'EneftigoContext';
import { useState } from 'react';
import { yocto_string_to_near, near_to_yocto, yocto_to_near } from 'helpers'
import { bidPrimaryListing, bidSecondaryListing } from 'nearInterface';
import { EneftigoModal } from 'EneftigoModal';
import { BidInfo } from './BidInfo';
import * as gas from 'gas';

const Modal = {
    INFO: 0,
};

export function BidDetails({ listing, bidAmount, open, handleClose }) {
    const [modal, setModal] = useState(null);

    const content =
        <div style={{ margin: "16px 32px 32px 32px" }}>
            <BidDetailsContent
                listing={listing}
                bidAmount={bidAmount}
            />
        </div>

    return (
        <>
            <EneftigoModal
                open={open && (modal === null || modal === Modal.INFO)}
                title="BID PLACEMENT"
                handleHelp={() => setModal(Modal.INFO)}
                handleClose={handleClose}
                content={content}
            />
            <BidInfo
                open={modal === Modal.INFO}
                handleClose={() => setModal(null)}
            />
        </>
    );
}

function BidDetailsContent({ listing, bidAmount }) {

    const { selector, contractId, account } = useEneftigoContext();

    const bidAmountYocto = (BigInt(parseInt(bidAmount)) * 10n ** 24n).toString();
    console.log(bidAmountYocto);

    const handlePlaceBid = async () => {
        try {
            if (listing.is_secondary) {
                await bidSecondaryListing({
                    selector,
                    contractId,
                    accountId: account.account_id,
                    listing,
                    bidAmountYocto,
                })
            } else {
                await bidPrimaryListing({
                    selector,
                    contractId,
                    accountId: account.account_id,
                    listing,
                    bidAmountYocto,
                });
            }
        } catch (error) {
            console.log(error);
            // setError(error.toString());
        }
    };
    // const storageCostYocto = BigInt(storage.nftMint(listing.nft_metadata.title, listing.nft_metadata.media, account.account_id)) * BigInt(storage.COST_PER_BYTE_YOCTO);
    // const transactionCostYocto = BigInt(gas.PRIMARY_LISTING_BID_GAS);// + storageCostYocto;
    // const transactionCostNear = yocto_string_to_near(transactionCostYocto, 4);

    return (
        <>
            <p style={{ textAlign: 'center' }} id="buy-modal-description">
                You are just about to place a bid.
            </p>
            <p style={{ textAlign: 'center' }} id="buy-modal-description">
                You will be redirected to your wallet to authorize the payment of {bidAmount} NEAR<br />plus gas costs
            </p>
            <p style={{ textAlign: 'center' }} id="buy-modal-description">
                Are you sure you want to continue?
            </p>
            <div className="flex-container" style={{ justifyContent: "space-evenly" }}>
                <button style={{ width: "120px" }} onClick={handlePlaceBid}>YES, I WANT TO BID</button>
            </div>
        </>
    );
}
