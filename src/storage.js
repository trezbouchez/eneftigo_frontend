/*
    Storage deposit values required by Marketplace calls
    Values are JS BigInt types, literals MUST end with 'n'
    They must be transformed to string before passing to the
    call (contract expects Near U128 wrapper type)
*/

import * as constants from "constants";

export const COST_PER_BYTE_YOCTO = 10000000000000000000n;

export function marketplaceAddBuyNowOnly(seller_id = null, title = null, mediaUrl = null, startDate = null, endDate = null) {
    if (seller_id == null && title == null && mediaUrl == null && startDate == null && endDate == null) {
        return 701 + 2 * constants.MAX_ACCOUNT_LENGTH + constants.MAX_TITLE_LENGTH + constants.MAX_URL_LENGTH + 8 + 8;     // worst-case
    }
    return 701
        + 2 * seller_id.length
        + title.length
        + mediaUrl.length
        + (startDate !== null ? 8 : 0)
        + (endDate !== null ? 8 : 0);
}

export function marketplaceAddAcceptingProposals(seller_id = null, title = null, mediaUrl = null, startDate = null) {
    if (seller_id == null && title == null && mediaUrl == null && startDate == null) {
        return 701 + 2 * constants.MAX_ACCOUNT_LENGTH + constants.MAX_TITLE_LENGTH + constants.MAX_URL_LENGTH + 8 + 8;     // worst-case
    }
    return 701
        + 2 * seller_id.length
        + title.length
        + mediaUrl.length
        + (startDate !== null ? 8 : 0)
        + 8;
}

export function nftMakeCollection(title = null, mediaUrl = null) {
    if (title == null && mediaUrl == null) {
        return 152 + constants.MAX_TITLE_LENGTH + 2 * constants.MAX_URL_LENGTH;
    }
    return 152 + title.length + 2 * mediaUrl.length;
}

export function nftMint(title = null, mediaUrl = null, receiverId = null) {
    if (title == null && mediaUrl == null && receiverId == null) {
        return 1013 + constants.MAX_TITLE_LENGTH + constants.MAX_URL_LENGTH + 2 * constants.MAX_ACCOUNT_LENGTH;
    }
    return 1013 + title.length + mediaUrl.length + 2 * receiverId.length;
}

export const NFT_APPROVE_WORST_CASE_STORAGE = 28n;

// export const NFT_MAKE_COLLECTION_WORST_CASE_STORAGE = 4376n;        // measured
// export const NFT_MINT_WORST_CASE_STORAGE = 830n;                    // measured
