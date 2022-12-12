import React, { useState } from 'react';
import { EneftigoModal } from 'EneftigoModal';
import { NewListingDetails } from './NewListingDetails'

export function NewListingCard({ showDetails, handleShowDetails, handleHideDetails }) {

    return (
        <div
            className="new_listing_card"
            style={{ display: "flex", alignItems: "center", borderStyle: "dashed", borderColor: "var(--eneftigo-grey", borderRadius: "12px", height: "320px", width: "200px" }}>
            <div
                margin="auto"
                style={{ margin: "auto" }}
            >
                <img
                    onClick={handleShowDetails}
                    width="60%"
                    src={require('assets/plus_icon_white.png')}
                    alt="+"
                />
                <p style={{ margin: "20px 0px 0px 0px", fontSize: "14px" }}>ADD LISTING</p>
            </div>
            <EneftigoModal
                open={showDetails}
                title="LISTING TYPE"
                handleClose={handleHideDetails}
                disableAutoFocus={true}
                content={<NewListingDetails handleClose={handleHideDetails} />}
            />
        </div>
    );
}
