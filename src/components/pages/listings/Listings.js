import 'regenerator-runtime/runtime';
import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Grid } from '@mui/material'
import { ListingCard } from 'components/cards/ListingCard';
import { MyListingCard } from 'components/cards/MyListingCard';
import { useEneftigoContext, useWalletSelectorContext } from 'EneftigoContext';
import { getPrimaryListings, getPrimaryListingsBySeller, getSecondaryListings, getSecondaryListingsBySeller } from 'nearInterface';
import { SectionHeader } from 'components/misc/SectionHeader';

const SHOW_FIRST_ITEMS_COUNT = 5;

export default function Listings() {
    const [busy, setBusy] = useState(true);
    const [primaryListings, setPrimaryListings] = useState([]);
    const [secondaryListings, setSecondaryListings] = useState([]);
    const [focusedItem, setFocusedItem] = useState(null);
    const [showMorePrimary, setShowMorePrimary] = useState(false);
    const [showMoreSecondary, setShowMoreSecondary] = useState(false);

    const { contractId, selector, account } = useEneftigoContext();

    const { sellerId } = useParams();

    React.useEffect(() => {
        const { network } = selector.options;
        let promises;
        if (sellerId) {
            promises = [
                getPrimaryListingsBySeller({ selector, contractId, sellerAccountId: sellerId }),
                getSecondaryListingsBySeller({ selector, contractId, sellerAccountId: sellerId })
            ]
        } else {
            promises = [
                getPrimaryListings({ selector, contractId }),
                getSecondaryListings({ selector, contractId })
            ]
        }
        Promise.all(promises)
            .then((values) => {
                setPrimaryListings(values[0].map((listing) => {
                    listing.is_secondary = false;
                    return listing;
                }));
                setSecondaryListings(values[1].map((listing) => {
                    listing.is_secondary = true;
                    return listing;
                }));
            })
            .catch(alert)
            .finally(() => {
                setBusy(false);
            });
    }, [sellerId]);

    const handleMorePrimary = () => {
        setShowMorePrimary((oldValue) => !oldValue);
    };

    const handleMoreSecondary = () => {
        setShowMoreSecondary((oldValue) => !oldValue);
    };

    const shownPrimary = showMorePrimary ? primaryListings : primaryListings.slice(0, Math.min(SHOW_FIRST_ITEMS_COUNT, primaryListings.length));
    const shownSecondary = showMoreSecondary ? secondaryListings : secondaryListings.slice(0, Math.min(SHOW_FIRST_ITEMS_COUNT, secondaryListings.length));

    return (
        <Grid style={{ padding: '10px', maxHeight: '90vh', overflow: 'auto' }} container justifyContent="center" spacing={5}>
            <Grid key="primary_header" item xs={12} sm={12}>
                <SectionHeader
                    title={"NEW ITEMS" + (sellerId ? " BY " + sellerId : "")}
                    showingMore={showMorePrimary}
                    onMoreButton={primaryListings.length > SHOW_FIRST_ITEMS_COUNT ? handleMorePrimary : null}
                />
            </Grid>
            {
                shownPrimary.map((listing) => {
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
            {
                primaryListings.length == 0 &&
                <Grid key="primary_desc" item >
                    <p style={{ width: "200px", fontSize: "12px", color: "var(--eneftigo-grey)", margin: "auto" }}>
                        There are no new items currently on sale.
                    </p>
                </Grid>
            }
            <Grid key="secondary_header" item xs={12} sm={12}>
                <SectionHeader
                    title={"PRE-OWNED ITEMS" + (sellerId ? " BY " + sellerId : "")}
                    showingMore={showMoreSecondary}
                    onMoreButton={secondaryListings.length > SHOW_FIRST_ITEMS_COUNT ? handleMoreSecondary : null}
                />
            </Grid>
            {
                shownSecondary.map((listing) => {
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
            {
                secondaryListings.length == 0 &&
                <Grid key="secondary_desc" item >
                    <p style={{ width: "200px", fontSize: "12px", color: "var(--eneftigo-grey)", margin: "auto" }}>
                        There are no pre-owned items currently on sale.
                    </p>
                </Grid>
            }
        </Grid>
    );
}
