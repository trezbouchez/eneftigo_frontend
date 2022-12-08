export const MAX_TITLE_LENGTH = 128;
export const MAX_URL_LENGTH = 2024;
export const MAX_ACCOUNT_LENGTH = 64;       // max Near account length

// Account Balance
export const BALANCE_MIN_YOCTO         = BigInt(    1_000_000_000_000_000_000_000);   // no transaction will be allowed when below 
export const BALANCE_LOW_YOCTO         = BigInt(  500_000_000_000_000_000_000_000);   // warning will be displayed when below 

// Storage Deposit
export const DEPOSIT_MIN_YOCTO         = BigInt(   50_000_000_000_000_000_000_000);   // no transaction will be allowed when below 
export const DEPOSIT_LOW_YOCTO         = BigInt(  500_000_000_000_000_000_000_000);   // warning will be displayed when below 
export const DEPOSIT_RECOMMENDED_YOCTO = BigInt(1_000_000_000_000_000_000_000_000);   // warning will be displayed when below

// module.exports = {
//     MAX_TITLE_LENGTH,
//     MAX_URL_LENGTH,
//     MAX_ACCOUNT_LENGTH,
//     BALANCE_MIN_YOCTO,
//     BALANCE_LOW_YOCTO,
//     DEPOSIT_MIN_YOCTO,
//     DEPOSIT_LOW_YOCTO,
//     DEPOSIT_RECOMMENDED_YOCTO
// };