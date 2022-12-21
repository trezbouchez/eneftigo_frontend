import React, { useState, useEffect } from "react";
import { Card, CardMedia } from '@mui/material'
import Sell from "components/misc/sell/Sell";
import { isListed } from 'nearInterface';
import { useEneftigoContext } from "EneftigoContext";
import EndSecondaryListing from "components/cards/End";
import { EneftigoModal } from 'EneftigoModal';
import { NftDetails } from "./NftDetails";

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


export default function NftCard({ nft, showDetails, handleShowDetails, handleHideDetails }) {
    const { selector, contractId/*, spotifyApi */ } = useEneftigoContext();
    const [listed, setListed] = useState(undefined);
    const [spotifyEmbed, setSpotifyEmbed] = useState(null);

    const tempUrl = "https://open.spotify.com/track/3BovdzfaX4jb5KFQwoPfAw";

    useEffect(() => {
        fetch(`https://open.spotify.com/oembed?url=${tempUrl}`)
            .then((response) => response.json())
            .then((data) => {
                setSpotifyEmbed(data.html);
            });
    }, [nft]);

    // if (spotifyApi) {
    //     console.log(spotifyElement);
    //     let options = {
    //         uri: 'spotify:episode:7makk4oTQel546B0PZlDM5'
    //     };
    //     let callback = (EmbedController) => { };
    //     spotifyApi.createController(spotifyElement, options, callback);
    // }

    isListed({ selector, contractId, nftContractId: nft.contract_id, tokenId: nft.token_id })
        .then((l) => {
            setListed(l);
        });

    return (
        <>
            <Card
                className="nft_card"
                variant="elevation"
                sx={{
                    backgroundColor: "var(--eneftigo-dark-grey)",
                    borderRadius: 3,
                    p: 1,
                    height: 300,
                    width: 300
                }}
            >
                <p id="listing_title_thumb" style={{ marginBottom: "12px" }}>{nft.metadata.title}</p>
                <div dangerouslySetInnerHTML={{ __html: spotifyEmbed }} />
                <CardMedia
                    onClick={handleShowDetails}
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
            <EneftigoModal
                sx={{ margin: "0px" }}
                open={showDetails}
                title="NFT DETAILS"
                handleClose={handleHideDetails}
                content={<NftDetails nft={nft} />}
            />
        </>
    );
}
