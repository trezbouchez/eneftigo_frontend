import React, { useState } from "react";
import { Card, CardMedia } from '@mui/material'
import Sell from "components/misc/sell/Sell";
import { isListed } from 'nearInterface';
import { useEneftigoContext } from "EneftigoContext";
import EndSecondaryListing from "components/cards/End";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
};

const dateFormat = new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: undefined,
});

export default function NftCard({ nft }) {
    const { selector, contractId } = useEneftigoContext();
    const [listed, setListed] = useState(undefined);

    isListed({ selector, contractId, nftContractId: nft.contract_id, tokenId: nft.token_id })
    .then((l) => {
        console.log(l);
        setListed(l);
    });

    return (
        <>
            <Card className="nft_card" variant="elevation" sx={{ borderRadius: 3, p: 1, height: 300, width: 200 }}>
                <p id="listing_title_thumb">{nft.metadata.title}</p>
                <CardMedia
                    style={{ borderRadius: "4px" }}
                    component="img"
                    height="180"
                    image={nft.metadata.media}
                    alt="Media"
                />
                <p>Minted on {dateFormat.format(Date.parse(nft.metadata.issued_at))}</p>
                <div className="flex-container">
                    {(function () {
                        if (listed !== undefined) {
                            if (listed === true) {
                                return <EndSecondaryListing nft={nft} />
                            } else if (listed === false) {
                                return <Sell nft={nft} />
                            }
                        }
                    })()}
                    {/* <Transfer contract={contract} nft={nft} /> */}
                </div>
            </Card>
        </>
    );
}
