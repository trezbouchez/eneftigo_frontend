import React, { useState } from 'react';
import { Card, CardMedia } from '@mui/material'
import { PriceLabel } from "components/misc/Price";
import { Buy } from "components/misc/buy/Buy";
import { Bid } from "components/misc/bid/Bid";
import TextField from '@mui/material/TextField';
import recycle from "assets/recycle.png";
import auction from "assets/auction.png";
import { yocto_string_to_near } from 'helpers'
import { ListingDetails } from './ListingDetails';
import { EneftigoModal } from 'EneftigoModal';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'var(--bg)',
    border: '2px solid #000',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
};

export function ListingCard({ listing, showDetails, handleShowDetails, handleHideDetails }) {

    const acceptableBidNear = listing.acceptable_bid_yocto ? yocto_string_to_near(listing.acceptable_bid_yocto, 1) : null;
    const [bid, setBid] = useState(acceptableBidNear);

    const bidValidator = (text) => {
        if (text === "") {
            setBid(text);
            return;
        }
        const cleaned = text.toLowerCase().replace(/[^0-9.]+/g, "");
        const number = parseFloat(cleaned);
        if (isNaN(number))      // if whitespaces only
            return;
        const rounded = Math.floor(number * 10 ** 2) / 10 ** 2;
        if (rounded === number)
            setBid(cleaned);
        else
            setBid(rounded);
    };

    return (
        <div style={{ position: "relative" }}>
            <Card
                className="listing_card"
                variant="elevation"
                sx={{
                    backgroundColor: "var(--eneftigo-dark-grey)",
                    borderRadius: 3,
                    p: 1,
                    height: 360,
                    width: 200,
                }}>
                {listing.is_secondary &&
                    <img style={{ position: "absolute", top: "5px", left: "8px" }} src={recycle} width="24" height="24" alt="N" />
                }
                {
                    listing.min_bid_yocto != null &&
                    <img style={{ position: "absolute", top: "5px", right: "8px" }} src={auction} width="24" height="24" alt="N" />
                }
                <p id="listing_title_thumb">{listing.nft_metadata.title}</p>
                <p> by {listing.seller_id}</p>
                <CardMedia
                    onClick={handleShowDetails}
                    style={{ borderRadius: "4px" }}
                    component="img"
                    height="180"
                    image={listing.nft_metadata.media}
                    alt="Media"
                />
                {
                    listing.is_secondary ?
                        <p>SELLING BY: TODO</p> :
                        <p>OFFERED: {listing.supply_total}, AVAILABLE: {listing.supply_left}</p>
                }
                {
                    listing.price_yocto &&
                    <div style={{ marginLeft: "16px", marginRight: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "18px" }}>
                        <PriceLabel price_yocto={listing.price_yocto} />
                        <Buy listing={listing} />
                    </div>
                }
                {
                    listing.min_bid_yocto &&
                    <div style={{ marginLeft: "16px", marginRight: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "18px" }}>
                        <TextField
                            value={bid}
                            size="small"
                            style={{ width: "70px" }}
                            required
                            // label="bid amount (Near)"
                            onChange={(e) => bidValidator(e.target.value)}
                            autoComplete="off"
                        />
                        <Bid listing={listing} bidAmount={bid}/>
                    </div>
                }
            </Card>
            <EneftigoModal
            sx={{margin:"0px"}}
                open={showDetails}
                title="LISTING DETAILS"
                handleClose={handleHideDetails}
                content={<ListingDetails listing={listing} />}
            />
        </div>
    );
}
