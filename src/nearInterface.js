import * as gas from 'gas.js'
import * as storage from 'storage.js'
import { providers } from "near-api-js";

export async function viewAccount({ selector, accountId, finality = 'optimistic' }) {
  const { network } = selector.options;
  const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });
  const result = await provider.query({
    request_type: 'view_account',
    account_id: accountId,
    finality: finality,
  });
  return result;
}

export async function getEneftigoCollectibles({ selector, contractId, accountId, fromIndex = '0', limit = 100, finality = 'optimistic' }) {
  let collectibles = await viewMethod({
    selector: selector,
    contractId: contractId,
    method: "nft_tokens_for_owner",
    args: { "account_id": accountId, "from_index": "0", "limit": 100 },
    finality: finality
  });

  for (let collectible of collectibles)
    collectible.contract_id = contractId;

  return collectibles;
}

export async function getStorageDeposit({ selector, contractId, accountId, finality = 'optimistic' }) {
  const result = await viewMethod({
    selector: selector,
    contractId: contractId,
    method: "deposit",
    args: { "account_id": accountId },
    finality: finality
  });
  return [BigInt(result[0]), result[1]];
}

export async function addStorageDeposit({
  selector,
  contractId,
  accountId,
  depositYocto,
  walletMeta = "place_deposit",
  walletCallbackUrl = window.location.pathname
}) {
  let depositString = BigInt(depositYocto).toString();
  await callMethod({
    selector: selector,
    contractId: contractId,
    accountId: accountId,
    method: 'place_deposit',
    args: {},
    gas: gas.DEPOSIT_ADD_GAS,
    deposit: depositString,
    walletMeta: walletMeta,
    walletCallbackUrl: walletCallbackUrl
  });
}

export async function withdrawStorageDeposit({
  selector,
  contractId,
  accountId,
  amountYocto,
  walletMeta = "withdraw_deposit",
  walletCallbackUrl = window.location.pathname
}) {
  let amountString = BigInt(amountYocto).toString();
  await callMethod({
    selector: selector,
    contractId: contractId,
    accountId: accountId,
    method: 'withdraw_deposit',
    args: {
      withdrawn_amount_yocto: amountString
    },
    deposit: 0,
    gas: gas.DEPOSIT_WITHDRAW_GAS,
    walletMeta: walletMeta,
    walletCallbackUrl: walletCallbackUrl
  });
}

export async function getPrimaryListings({ selector, contractId, fromIndex = '0', limit = 20 }) {
  return await viewMethod({
    selector: selector,
    contractId: contractId,
    method: 'primary_listings',
    args: {
      from_index: fromIndex,
      limit: limit
    },
    finality: 'optimistic'
  });
}

export async function getPrimaryListingsBySeller({ selector, contractId, sellerAccountId, fromIndex = '0', limit = 20 }) {
  return await viewMethod({
    selector: selector,
    contractId: contractId,
    method: 'primary_listings_by_seller',
    args: {
      seller_account_id: sellerAccountId,
      from_index: fromIndex,
      limit: limit
    },
    finality: 'optimistic'
  });
}

export async function getSecondaryListings({ selector, contractId, fromIndex = '0', limit = 20 }) {
  return await viewMethod({
    selector: selector,
    contractId: contractId,
    method: 'secondary_listings',
    args: {
      from_index: fromIndex,
      limit: limit
    },
    finality: 'optimistic'
  });
}

export async function getSecondaryListingsBySeller({ selector, contractId, sellerAccountId, fromIndex = '0', limit = 20 }) {
  return await viewMethod({
    selector: selector,
    contractId: contractId,
    method: 'secondary_listings_by_seller',
    args: {
      seller_account_id: sellerAccountId,
      from_index: fromIndex,
      limit: limit
    },
    finality: 'optimistic'
  });
}

export async function getPrimaryListingBids({ selector, contractId, nftContractId, collectionId, fromIndex = "0", limit = "20" }) {
  return await viewMethod({
    selector: selector,
    contractId: contractId,
    method: 'primary_listing_bids',
    args: {
      nft_contract_id: nftContractId,
      collection_id: collectionId,
      from_index: fromIndex,
      limit: limit
    },
    finality: 'optimistic'
  });
}

export async function isListed({ selector, contractId, nftContractId, tokenId }) {
  const result = await viewMethod({
    selector: selector,
    contractId: contractId,
    method: 'is_listed',
    args: {
      nft_contract_id: nftContractId,
      token_id: tokenId,
    },
    finality: 'final'
  });
  return result;
}

export async function addPrimaryListing({
  selector,
  contractId,
  accountId,
  title,
  imageUrl,
  auxAudioUrl,
  supplyTotal,
  priceYocto,
  minBidYocto,
  startDate = null,
  endDate = null,
  walletMeta = "primary_listing_add",
  walletCallbackUrl = window.location.protocol + '//' + window.location.host + window.location.pathname
}) {
  let result = await callMethodAndGetResult({
    selector: selector,
    contractId: contractId,
    accountId: accountId,
    method: 'primary_listing_add',
    args: {
      title: title,
      image_url: imageUrl,
      aux_audio_url: auxAudioUrl,
      supply_total: supplyTotal,
      price_yocto: priceYocto,
      min_bid_yocto: minBidYocto,
      start_date: startDate,
      end_date: endDate
    },
    gas: gas.FPO_BUY_NOW_ONLY_ADD,
    deposit: "0",
    walletMeta: walletMeta,
    walletCallbackUrl: walletCallbackUrl
  });
  return { collectionId: result[0], updatedDeposit: BigInt(result[1]) };
}

export async function buyPrimaryListing({
  selector,
  contractId,
  accountId,
  listing,
  walletMeta = "primary_listing_buy",
  walletCallbackUrl = window.location.protocol + '//' + window.location.host + window.location.pathname
}) {
  if (!listing.price_yocto)
    throw new Error("Buy Now not allowed for this listing");
  let storageTotal = storage.nftMint(listing.nft_metadata.title, listing.nft_metadata.media, accountId);
  let deposit = (BigInt(storageTotal) * storage.COST_PER_BYTE_YOCTO + BigInt(listing.price_yocto)).toString();
  const result = await callMethodAndGetResult({
    selector: selector,
    contractId: contractId,
    accountId: accountId,
    method: 'primary_listing_buy',
    args: {
      nft_contract_id: listing.nft_contract_id,
      collection_id: listing.collection_id
    },
    gas: gas.FPO_BUY_NOW_ONLY_BUY_GAS,
    deposit: deposit,
    walletMeta: walletMeta,
    walletCallbackUrl: walletCallbackUrl
  });
  return result;
}

export async function bidPrimaryListing({
  selector,
  contractId,
  accountId,
  listing,
  bidAmountYocto,
  walletMeta = "primary_listing_bid",
  walletCallbackUrl = window.location.protocol + '//' + window.location.host + window.location.pathname
}) {
  const result = await callMethodAndGetResult({
    selector: selector,
    contractId: contractId,
    accountId: accountId,
    method: 'primary_listing_place_bid',
    args: {
      nft_contract_id: listing.nft_contract_id,
      collection_id: listing.collection_id,
      amount_yocto: bidAmountYocto.toString(),
    },
    gas: gas.PRIMARY_LISTING_BID_GAS,
    deposit: bidAmountYocto.toString(),
    walletMeta: walletMeta,
    walletCallbackUrl: walletCallbackUrl
  });
  return result;
}

export async function buySecondaryListing({
  selector,
  contractId,
  accountId,
  listing,
  walletMeta = "secondary_listing_buy",
  walletCallbackUrl = window.location.protocol + '//' + window.location.host + window.location.pathname
}) {
  if (!listing.price_yocto)
    throw new Error("Buy Now not allowed for this listing");
  let deposit = (BigInt(listing.price_yocto) + BigInt(1)).toString();
  const result = await callMethodAndGetResult({
    selector: selector,
    contractId: contractId,
    accountId: accountId,
    method: 'secondary_listing_buy',
    args: {
      nft_contract_id: listing.nft_contract_id,
      token_id: listing.token_id,
    },
    gas: gas.FPO_BUY_NOW_ONLY_BUY_GAS,
    deposit: deposit,
    walletMeta: walletMeta,
    walletCallbackUrl: walletCallbackUrl
  });
  return result;
}

export async function bidSecondaryListing({
  selector,
  contractId,
  accountId,
  listing,
  bidAmountYocto,
  walletMeta = "secondary_listing_bid",
  walletCallbackUrl = window.location.protocol + '//' + window.location.host + window.location.pathname
}) {
  if (!listing.min_bid_yocto)
    throw new Error("Bidding not allowed for this listing");
    
    // TODO
}

export async function concludeSecondaryListing({
  selector,
  marketplaceContractId,
  sellerId,
  nftContractId,
  tokenId,
  walletMeta = "secondary_listing_conclude",
  walletCallbackUrl = window.location.protocol + '//' + window.location.host + window.location.pathname
}) {
  let result = await callMethodAndGetResult({
    selector: selector,
    contractId: marketplaceContractId,
    accountId: sellerId,
    method: 'secondary_listing_conclude',
    args: {
      owner_id: sellerId,
      nft_contract_id: nftContractId,
      token_id: tokenId,
    },
    gas: gas.SECONDARY_LISTING_CONCLUDE_GAS,
    deposit: "0",
    walletMeta: walletMeta,
    walletCallbackUrl: walletCallbackUrl
  });
}


/*
    NFT
*/

export async function isNftApproved({ selector, nftContractId, tokenId, approvedAccountId, approvalId }) {
  return await viewMethod({
    selector: selector,
    contractId: nftContractId,
    method: 'nft_is_approved',
    args: {
      token_id: tokenId,
      approved_account_id: approvedAccountId,
      approval_id: approvalId,
    },
    finality: 'final'
  });
}

export async function nftApprove({
  selector,
  sellerId,
  nftContractId,
  tokenId,
  approvedAccountId,
  msg,
  walletMeta = "nft_approve",
  walletCallbackUrl = window.location.protocol + '//' + window.location.host + window.location.pathname
}) {
  let storageTotal = storage.NFT_APPROVE_WORST_CASE_STORAGE;    // TODO: compute for given accountId
  let deposit = BigInt(storageTotal) * storage.COST_PER_BYTE_YOCTO;
  let result = await callMethodAndGetResult({
    selector: selector,
    contractId: nftContractId,
    accountId: sellerId,
    method: 'nft_approve',
    args: {
      token_id: tokenId,
      account_id: approvedAccountId,
      msg: JSON.stringify(msg),
    },
    gas: gas.SECONDARY_LISTING_ADD_BUY_NOW_GAS,
    deposit: deposit,
    walletMeta: walletMeta,
    walletCallbackUrl: walletCallbackUrl
  });
}

export async function nftRevoke({
  selector,
  sellerId,
  nftContractId,
  tokenId,
  approvedAccountId,
  walletMeta = "nft_approve",
  walletCallbackUrl = window.location.protocol + '//' + window.location.host + window.location.pathname
}) {
  let result = await callMethodAndGetResult({
    selector: selector,
    contractId: nftContractId,
    accountId: sellerId,
    method: 'nft_approve',
    args: {
      token_id: tokenId,
      account_id: approvedAccountId,
    },
    gas: gas.SECONDARY_LISTING_ADD_BUY_NOW_GAS,
    deposit: "1",
    walletMeta: walletMeta,
    walletCallbackUrl: walletCallbackUrl
  });
}

// Make a read-only call to retrieve information from the network
async function viewMethod({ selector, contractId, method, args = {}, finality }) {
  const { network } = selector.options;
  const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });
  const result = await provider.query({
    request_type: 'call_function',
    account_id: contractId,
    method_name: method,
    args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
    finality: 'optimistic'
  });
  return result.result && result.result.length > 0 && JSON.parse(Buffer.from(result.result));
}

// Call a method that changes the contract's state
async function callMethodAndGetResult({ selector, contractId, accountId, method, args, gas, deposit }) {
  const outcome = await callMethod({ selector, contractId, accountId, method, args, gas, deposit });
  return await getTransactionResult({ selector, hash: outcome.transaction.hash });
}

// Call a method that changes the contract's state
async function callMethod({ selector, contractId, accountId, method, args, gas, deposit }) {
  try {
    const wallet = await selector.wallet();
    return await wallet.signAndSendTransaction({
      signerId: accountId,
      receiverId: contractId,
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName: method,
            args,
            gas,
            deposit,
          },
        },
      ],
    });
  } catch (error) {
    console.log(error.message);
    throw new Error(`${method} failed`);
  };
}

async function getTransactionResult({ selector, hash }) {
  try {
    const { network } = selector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });
    const transaction = await provider.txStatus(hash, 'unnused');
    return providers.getTransactionLastResult(transaction);
  } catch (error) {
    console.log(error.message);
    throw new Error("Unknown transaction result");
  }
}
