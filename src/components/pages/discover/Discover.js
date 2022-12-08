import 'regenerator-runtime/runtime';
import React, { useState, useContext } from 'react';
import { Grid } from '@mui/material'
import { ListingCard } from 'components/cards/ListingCard';
import { MyListingCard } from 'components/cards/MyListingCard';
import { useEneftigoContext, useWalletSelectorContext } from 'EneftigoContext';
import { getPrimaryListings, getSecondaryListings } from 'nearInterface';

export default function Discover() {
    const [busy, setBusy] = React.useState(true);
    const [listings, setListings] = React.useState([]);
    const [focusedItem, setFocusedItem] = React.useState(null);

    const { contractId, selector, account } = useEneftigoContext();

    // TODO: turn this into useCallback?
    React.useEffect(() => {
        const { network } = selector.options;
        Promise.all([
            getPrimaryListings({ selector, contractId }),
            getSecondaryListings({ selector, contractId })
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

    return (
        <Grid style={{ padding: '10px', maxHeight: '90vh', overflow: 'auto' }} container justifyContent="center" spacing={5}>
            {
                listings.map((listing) => {
                    const key = listing.nft_contract_id + ":" + listing.collection_id;
                    return (
                        <Grid key={key} item>
                            {listing.seller_id == account.account_id ?
                                <MyListingCard
                                    listing={listing}
                                    showDetails={key === focusedItem}
                                    handleShowDetails={() => setFocusedItem(key)}
                                    handleHideDetails={() => setFocusedItem(null)}
                                /> :
                                <ListingCard
                                    listing={listing}
                                    showDetails={key === focusedItem}
                                    handleShowDetails={() => setFocusedItem(key)}
                                    handleHideDetails={() => setFocusedItem(null)}
                                />
                            }
                        </Grid>
                    );
                })
            }
        </Grid>
    );
}
