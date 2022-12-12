import 'regenerator-runtime/runtime';
import React from 'react';
import { Grid } from '@mui/material'
import NftCard from 'components/cards/NftCard';
import { useEneftigoContext } from 'EneftigoContext';
import { getPrimaryListingsBySeller, getSecondaryListingsBySeller } from 'nearInterface';
import { MyListingCard } from 'components/cards/MyListingCard';
import { NewListingCard } from 'components/cards/NewListingCard'
import { SectionHeader } from 'components/misc/SectionHeader';

const SHOW_FIRST_ITEMS_COUNT = 3;

export default function Home() {
    const [busy, setBusy] = React.useState(true);
    const [listings, setListings] = React.useState([]);
    const [focusedItem, setFocusedItem] = React.useState(null);
    const [showMoreListings, setShowMoreListings] = React.useState(false);
    const [showMoreTokens, setShowMoreTokens] = React.useState(false);

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

    const shownListings = showMoreListings ? listings : listings.slice(0, Math.min(SHOW_FIRST_ITEMS_COUNT - 1, listings.length));
    const shownTokens = showMoreTokens ? collectibles : collectibles.slice(0, Math.min(SHOW_FIRST_ITEMS_COUNT, collectibles.length));

    const handleMoreListings = () => {
        setShowMoreListings((oldValue) => !oldValue);
    };

    const handleMoreTokens = () => {
        setShowMoreTokens((oldValue) => !oldValue);
    };

    return (
        <div>
            <Grid style={{ padding: '24px 0px', maxHeight: '90vh', overflow: 'auto' }} container justifyContent="center" alignItems="center" spacing={5}>
                <Grid key="listings_header" item xs={12} sm={12}>
                    <SectionHeader
                        title="YOUR ACTIVE LISTINGS"
                        showingMore={showMoreListings}
                        onMoreButton={listings.length > SHOW_FIRST_ITEMS_COUNT - 1 ? handleMoreListings : null}
                    />
                </Grid>
                {
                    listings.length <= 1 &&
                    <Grid key="listing_desc" item >
                        <p style={{ width: "200px", fontSize: "12px", color: "var(--eneftigo-grey)", margin: "auto" }}>
                            This is where all your active listings will be displayed.<br />An active listing is the one you created or placed a bid in.<br />
                            Click an item to reveal more details or to place a new listing.
                        </p>
                    </Grid>
                }
                {
                    shownListings.map((listing) => {
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
                <Grid key="new_listing" item>
                    <NewListingCard
                        showDetails={focusedItem === "new"}
                        handleShowDetails={() => setFocusedItem("new")}
                        handleHideDetails={() => setFocusedItem(null)}
                    />
                </Grid>

                <Grid key="tokens_header" item xs={12} sm={12}>
                    <SectionHeader
                        title="TOKENS YOU OWN"
                        showingMore={showMoreTokens}
                        onMoreButton={collectibles.length > SHOW_FIRST_ITEMS_COUNT ? handleMoreTokens : null}
                    />
                </Grid>
                {
                    collectibles.length <= 1 &&
                    <Grid key="listing_token" item >
                        <p style={{ width: "200px", fontSize: "12px", color: "var(--eneftigo-grey)", margin: "auto" }}>
                            This is where all Eneftigo tokens you own will be shown.<br />You can transfer your tokens or put them on sale.<br />
                        </p>
                    </Grid>
                }
                {collectibles.map((nft) => (
                    <Grid key={(nft.collection_id + ":" + nft.token_id)} item>
                        <NftCard nft={nft} />
                    </Grid>
                ))}
            </Grid>
        </div>
    );
    // }
}
