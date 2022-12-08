import 'regenerator-runtime/runtime';
import React from 'react';
import { Grid } from '@mui/material'
import NftCard from 'components/cards/NftCard';
import { useEneftigoContext } from 'EneftigoContext';
import { getPrimaryListingsBySeller, getSecondaryListingsBySeller } from 'nearInterface';
import { MyListingCard } from 'components/cards/MyListingCard';
import { NewListingCard } from 'components/cards/NewListingCard'

const SHOW_FIRST_LISTINGS_COUNT = 3;

export default function Home() {
    const [busy, setBusy] = React.useState(true);
    const [listings, setListings] = React.useState([]);
    const [focusedItem, setFocusedItem] = React.useState(null);

    const { contractId, selector, collectibles, account } = useEneftigoContext();

    React.useEffect(() => {
        const { network } = selector.options;
        Promise.all([
            getPrimaryListingsBySeller({ selector, contractId, sellerAccountId: account.account_id }),
            getSecondaryListingsBySeller({ selector, contractId, sellerAccountId: account.account_id })
        ])
            .then((values) => {
                const primaryListings = values[0].map((listing) => {
                    listing.is_secondary = false;
                    return listing;
                });
                const secondaryListings = values[1].map((listing) => {
                    listing.is_secondary = true;
                    return listing;
                });
                setListings(primaryListings.concat(secondaryListings));
            })
            .catch(alert)
            .finally(() => {
                setBusy(false);
            });
    }, []);

    const firstListings = listings.slice(0, Math.min(SHOW_FIRST_LISTINGS_COUNT, listings.length));

    return (
        <>
            <p>Your NFTs</p>
            <Grid style={{ padding: '10px', maxHeight: '90vh', overflow: 'auto' }} container justifyContent="center" alignItems="center" spacing={5}>
                {collectibles.map((nft) => (
                    <Grid key={(nft.collection_id + ":" + nft.token_id)} item>
                        <NftCard nft={nft} />
                    </Grid>
                ))}
            </Grid>
            <p>Your Listings</p>
            <Grid style={{ padding: '10px', maxHeight: '90vh', overflow: 'auto' }} container justifyContent="center" alignItems="center" spacing={5}>
                {
                    firstListings.map((listing) => {
                        const key = listing.nft_contract_id + ":" + listing.collection_id;
                        return (
                            <Grid key={key} item>
                                <MyListingCard
                                    listing={listing}
                                    showDetails={key === focusedItem}
                                    handleShowDetails={() => setFocusedItem(key)}
                                    handleHideDetails={() => setFocusedItem(null)}
                                />
                            </Grid>
                        );
                    })
                }
                <Grid key="new" item>
                    <NewListingCard
                        showDetails={focusedItem === "new"}
                        handleShowDetails={() => setFocusedItem("new")}
                        handleHideDetails={() => setFocusedItem(null)}
                    />
                </Grid>
            </Grid>
        </>
    );
    // }
}
