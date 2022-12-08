import React, { useState } from 'react';
import { EneftigoModal } from 'EneftigoModal';
import { NewListingDetails } from './NewListingDetails'

export function NewListingCard({ showDetails, handleShowDetails, handleHideDetails }) {

    return (
        <div>
            <div
                className="new_listing_card"
                style={{ position: "relative", height: "200px", width: "200px" }}
            >
                <img
                    onClick={handleShowDetails}
                    width="80%"
                    src={require('assets/plus_icon_white.png')}
                    alt="+"
                />
                <p>ADD LISTING</p>
            </div>
            <EneftigoModal
                sx={{ margin: "0px" }}
                open={showDetails}
                title="LISTING DETAILS"
                handleClose={handleHideDetails}
                content={<NewListingDetails />}
            />
        </div>
    );
}
