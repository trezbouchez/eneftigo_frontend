import { useState, useEffect } from 'react';
import { useEneftigoContext } from 'EneftigoContext';
import { getPrimaryListingBids } from 'nearInterface';
import { yocto_string_to_near } from 'helpers'

const humanDate = (timestamp) => {
    if (timestamp) {
        const options = { year: "numeric", month: "long", day: "numeric", weekday: "long" }
        return new Date(timestamp / 1000000).toLocaleTimeString(undefined, options);
    } else {
        return null;
    }
};

export function NftDetails({ nft }) {

    return (
        <div position="relative" style={{ position: "relative", width: "500px", height: "500px" }}>
            <img style={{ position: "absolute", width: "500px", height: "500px", opacity: "0.15" }} src={nft.metadata.media} />
        </div>
    );
}
