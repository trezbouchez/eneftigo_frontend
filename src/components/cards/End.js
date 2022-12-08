import React from 'react';
import { useEneftigoContext } from 'EneftigoContext';
import { Box } from '@mui/material'
import { toast } from "react-hot-toast";
import { getStorageDeposit, viewAccount, nftRevoke, concludeSecondaryListing } from 'nearInterface';
import { EneftigoModal } from 'EneftigoModal';


export default function EndSecondaryListing({ nft }) {
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <p style={{ margin: "5px", textAlign: 'center' }}>
                <EndButton onClick={handleOpen} />
            </p>
            {<EndSecondaryListingModal nft={nft} open={open} handleClose={handleClose} />}
        </>
    );
}

function EndButton({ onClick }) {
    return (
        <>
            <button className="action-button action-button-destructive" onClick={onClick}>
                END
            </button>
        </>
    )
}

async function endListing({ selector, contractId, account, nft }) {
    // removing listing must complete, so we don't catch right away
    await concludeSecondaryListing({
        selector,
        marketplaceContractId: contractId,
        sellerId: account.account_id,
        nftContractId: nft.contract_id,
        tokenId: nft.token_id,
    });

    // revoking of approval is performed in a best-effort manner, so we catch
    // we still await though, because we don't want to announce a success and then
    // redirect to wallet (revoking requires 1yN to be attached)
    await nftRevoke({
        selector,
        sellerId: account.account_id,
        nftContractId: nft.contract_id,
        tokenId: nft.token_id,
        approvedAccountId: contractId,
    }).catch(error => console.log(error));
}

function EndSecondaryListingModal({ nft, open, handleClose }) {
    const { selector, contractId, account, setAccount, setDeposit } = useEneftigoContext();

    const handleSubmit = () => {
        const promiseChain = endListing({
            selector: selector,
            contractId: contractId,
            account: account,
            nft: nft,
        }).then(async () => {
            try {
                await Promise.all([
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
                        console.log("updated balance " + updatedAccountData.amount);
                        const updatedAccount = {
                            account_id: account.account_id,
                            ...updatedAccountData,
                        };
                        setAccount(updatedAccount);
                    })
                ]);
            } catch (error) {
                return console.log(error);
            }
        });

        toast.promise(
            promiseChain,
            {
                loading: 'Ending NFT listing...',
                success: <p style={{ margin: '0px' }}>NFT listing ended</p>,
                error: (error) => <p style={{ margin: '0px' }}>Could not terminate NFT listing<br /><span style={{ fontSize: 'var(--eneftigo-font-size-small)' }}>{error.message}</span></p>,
            },
            {
                style: {
                    minWidth: '300px',
                },
                success: {
                    duration: 5000,
                },
            }
        );
    };

    const content =
        <div style={{ margin: "16px 32px 32px 32px" }}>

            <Box sx={{ position: "relative", marginLeft: "auto", marginRight: "auto", borderRadius: 3, p: 1, height: "200px", width: "400px" }}>
                <p style={{ textAlign: 'center' }} id="buy-modal-description">
                    You are just about to remove the NFT listing.
                </p>
                <p style={{ textAlign: 'center', marginBlockEnd: "50px" }} id="buy-modal-description">
                    Are you sure you want to proceed?
                </p>
                <div className="flex-container" style={{ justifyContent: "space-evenly" }}>
                    <button className="action-button-destructive" style={{ width: "100px" }} onClick={handleSubmit}>YES, END LISTING</button>
                </div>
            </Box>
        </div>
    return (
        <>
            <EneftigoModal
                open={open}
                title="REMOVE NFT LISTING"
                handleClose={handleClose}
                content={content}
            />
        </>
    );
}
