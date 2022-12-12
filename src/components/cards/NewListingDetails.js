import React from 'react';
import { Card } from '@mui/material'
import NewListingAuction from './NewListingAuction'
import NewListingFixedPrice from './NewListingFixedPrice'
import { EneftigoModal } from 'EneftigoModal';
import { createTheme, ThemeProvider } from '@mui/system';

const ListingType = {
    FixedPrice: 0,
    Auction: 1,
};

export function NewListingDetails({ handleClose }) {
    const [listingType, setListingType] = React.useState(null);

    const fixedPriceListingContent = <div style={{ margin: "16px 32px 32px 32px" }}><NewListingFixedPrice /></div>;
    const auctionListingContent = <div style={{ margin: "16px 32px 32px 32px" }}><NewListingAuction /></div>;

    const close = () => {
        setListingType(null);
        handleClose();
    }

    return (
        <div>
            <EneftigoModal
                open={listingType === ListingType.FixedPrice}
                title="CREATE FIXED PRICE LISTING"
                handleHelp={() => console.log("help")}
                handleClose={() => close()}
                content={fixedPriceListingContent}
            />
            <EneftigoModal
                open={listingType === ListingType.Auction}
                title="CREATE AUCTION LISTING"
                handleHelp={() => console.log("help")}
                handleClose={() => close()}
                content={auctionListingContent}
            />
            <div style={{ margin: "16px 32px 32px 32px" }}>
                <p>What kind of NFT listing do you want to create?</p>
                <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-evenly" }}>
                    <button style={{ width: "120px", height: "40px" }} onClick={(e) => setListingType(ListingType.FixedPrice)}>
                        FIXED PRICE
                    </button>
                    <button style={{ width: "120px", height: "40px" }} onClick={(e) => setListingType(ListingType.Auction)}>
                        AUCTION
                    </button>
                </div>
            </div>
        </div>
    );
}