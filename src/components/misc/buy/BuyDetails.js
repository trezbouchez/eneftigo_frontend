import { useEneftigoContext } from 'EneftigoContext';
import { useState } from 'react';
import { yocto_string_to_near } from 'helpers'
import { buyPrimaryListing, buySecondaryListing } from 'nearInterface';
import { EneftigoModal } from 'EneftigoModal';
import { BuyInfo } from './BuyInfo.js';
import * as gas from 'gas';

const Modal = {
    INFO: 0,
};

export function BuyDetails({ listing, open, handleClose }) {
    const [modal, setModal] = useState(null);

    const content =
        <div style={{ margin: "16px 32px 32px 32px" }}>
            <BuyDetailsContent
                listing={listing}
            />
        </div>

    return (
        <>
            <EneftigoModal
                open={open && (modal === null || modal === Modal.INFO)}
                title="NFT PURCHASE"
                handleHelp={() => setModal(Modal.INFO)}
                handleClose={handleClose}
                content={content}
            />
            <BuyInfo
                open={modal === Modal.INFO}
                handleClose={() => setModal(null)}
            />
        </>
    );
}

function BuyDetailsContent({ listing }) {

    const { selector, contractId, account } = useEneftigoContext();

    const handlePurchase = async () => {
        try {
            if (listing.is_secondary) {
                await buySecondaryListing({
                    selector,
                    contractId,
                    accountId: account.account_id,
                    listing,

                })
            } else {
                await buyPrimaryListing({
                    selector,
                    contractId,
                    accountId: account.account_id,
                    listing,
                });
            }
        } catch (error) {
            console.log(error);
            // setError(error.toString());
        }
    };
    // const storageCostYocto = BigInt(storage.nftMint(listing.nft_metadata.title, listing.nft_metadata.media, account.account_id)) * BigInt(storage.COST_PER_BYTE_YOCTO);
    const transactionCostYocto = BigInt(gas.FPO_BUY_NOW_ONLY_BUY_GAS);// + storageCostYocto;
    const transactionCostNear = yocto_string_to_near(transactionCostYocto, 4);

    return (
        <>
            <p style={{ textAlign: 'center' }} id="buy-modal-description">
                You are just about to buy the NFT.
            </p>
            <p style={{ textAlign: 'center' }} id="buy-modal-description">
                You will be redirected to your wallet to authorize the payment of {yocto_string_to_near(listing.price_yocto, 0)} NEAR<br />plus gas costs (less than {transactionCostNear} NEAR)
            </p>
            <p style={{ textAlign: 'center' }} id="buy-modal-description">
                Are you sure you want to continue with your purchase?
            </p>
            <div className="flex-container" style={{ justifyContent: "space-evenly" }}>
                <button style={{ width: "100px" }} onClick={handlePurchase}>YES, I WANT TO BUY</button>
            </div>
        </>
    );
}
