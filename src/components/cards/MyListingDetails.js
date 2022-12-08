import { useState, useEffect } from 'react';
import { useEneftigoContext } from 'EneftigoContext';
import { getPrimaryListingBids } from 'nearInterface';
import { yocto_string_to_near, near_to_yocto, yocto_to_near } from 'helpers'
import { Card, CardMedia } from '@mui/material'
import { PriceLabel } from "components/misc/Price";
import * as gas from 'gas';
import recycle from "assets/recycle.png";
import auction from "assets/auction.png";

const humanDate = (timestamp) => {
    if (timestamp) {
        const options = { year: "numeric", month: "long", day: "numeric", weekday: "long" }
        return new Date(timestamp / 1000000).toLocaleTimeString(undefined, options);
    } else {
        return null;
    }
};

export function MyListingDetails({ listing }) {

    return (
        <div position="relative" style={{ position: "relative", width: "500px", height: "500px" }}>
            <img style={{ position: "absolute", width: "500px", height: "500px", opacity: "0.15" }} src={listing.nft_metadata.media} />
            <div style={{ position: "absolute", width: "480px", height: "480px", margin: "10px" }}>
                <p id="listing_title_thumb" style={{ margin: "0px", textAlign: "center", fontSize: "24px" }}>{listing.nft_metadata.title}</p>
                <p style={{ textAlign: "center", margin: "0px", fontSize: "14px" }}>by {listing.seller_id}</p>
                <p style={{ fontSize: "12px" }}>STATUS: {
                    listing.status === "Running" ? "Accepting Offers" : listing.status
                }</p>
                <p style={{ fontSize: "12px" }}>ENDING: {
                    listing.end_timestamp ? humanDate(listing.end_timestamp) : "Open"
                }</p>
                <p style={{ fontSize: "12px" }}>TOTAL ITEMS OFFERED: {
                    listing.supply_total
                }</p>
                <p style={{ fontSize: "12px" }}>ITEMS LEFT: {
                    listing.supply_left
                }</p>
                <p style={{ fontSize: "12px" }}>PRICE: {
                    listing.price_yocto ? yocto_string_to_near(listing.price_yocto, 1) + " N" : "Auction-Only"
                }</p>
                {
                    listing.min_bid_yocto ?
                    <div>
                        <p style={{ textAlign: "center", fontSize: "12px" }}>{listing.status === "Running" && "CURRENT "}WINNING BIDS: </p>
                        <div style={{ margin: "0px 64px" }} >
                            <HighestBids listing={listing} />
                        </div>
                    </div> :
                    <p style={{fontSize: "12px"}}>BIDS: Not accepted (fixed-price only)</p>
                }
                <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-evenly" }}>
                    <button style={{ /*backgroundColor: "var(--eneftigo-red)", */width: "120px", height: "40px" }} onClick={(e) => console.log("TODO")}>
                        END LISTING
                    </button>
                </div>
            </div>
        </div>
    );
}

function HighestBids({ listing }) {
    const { selector, contractId } = useEneftigoContext();
    const [bids, setBids] = useState(null);

    useEffect(() => {
        getPrimaryListingBids(
            {
                selector,
                contractId,
                nftContractId: listing.nft_contract_id,
                collectionId: listing.collection_id,
            }
        ).then((bids) => {
            setBids(bids);
        })
    });

    return (
        <div>
            {
                bids ?
                bids.length == 0 ? <p style={{fontSize: "14px", textAlign:"center"}}>no bids yet</p> :
                 bids.map((bid) => {
                    return (
                        <div style={{ fontSize: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "18px" }}>
                            <p style={{margin:"0px"}}>{bid.bidder_id}</p>
                            <p style={{margin:"0px"}}>{yocto_string_to_near(bid.amount_yocto, 1) + " N"}</p>
                        </div>
                    );
                })
                : "fetching bids"
            }
        </div>
    );
}