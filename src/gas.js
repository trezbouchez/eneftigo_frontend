
/*
    Prepaid gas required by various Marketplace calls
    Values are regular JS integers, they get mapped onto 
    contract's Rust u64
*/

export const DEPOSIT_ADD_GAS = 50000000000000;
export const DEPOSIT_WITHDRAW_GAS = 50000000000000;

export const FPO_BUY_NOW_ONLY_ADD = 50000000000000;
export const FPO_BUY_NOW_ONLY_BUY_GAS = 100000000000000;

export const PRIMARY_LISTING_BID_GAS = 50000000000000;
export const SECONDARY_LISTING_BID_GAS = 50000000000000;

export const SECONDARY_LISTING_ADD_BUY_NOW_GAS = 50000000000000;
export const SECONDARY_LISTING_CONCLUDE_GAS = 50000000000000;