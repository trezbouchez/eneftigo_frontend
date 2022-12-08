import React, { useCallback, useContext, useEffect, useState } from "react";
import { map, distinctUntilChanged } from "rxjs";
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupDefaultWallets } from "@near-wallet-selector/default-wallets";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import { setupMathWallet } from "@near-wallet-selector/math-wallet";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupNightlyConnect } from "@near-wallet-selector/nightly-connect";
import { setupWalletConnect } from "@near-wallet-selector/wallet-connect";
import { viewAccount, getEneftigoCollectibles, getStorageDeposit } from "nearInterface";

const CONTRACT_ID = "eneftigo.testnet";

export const EneftigoContext = React.createContext(null);

export function EneftigoContextAware(Content) {
    const [loading, setLoading] = useState(true);
    const [selector, setSelector] = useState(null);
    const [modal, setModal] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [account, setAccount] = useState(null);               // selected account data 
    const [collectibles, setCollectibles] = useState([]);
    const [deposit, setDeposit] = useState((0, false));

    const init = useCallback(async () => {
        const _selector = await setupWalletSelector({
            network: "testnet",
            debug: true,
            modules: [
                ...(await setupDefaultWallets()),
                setupNearWallet(),
                setupSender(),
                setupMathWallet(),
                setupNightly(),
                setupMeteorWallet(),
                setupWalletConnect({
                    projectId: "Eneftigo",
                    metadata: {
                        name: "Eneftigo Music NFT Marketplace",
                        description: "Your place to trade music NFTs",
                        url: "https://github.com/near/wallet-selector",
                        icons: ["https://avatars.githubusercontent.com/u/37784886"],
                    },
                }),
                setupNightlyConnect({
                    url: "wss://relay.nightly.app/app",
                    appMetadata: {
                        additionalInfo: "",
                        application: "Eneftigo Music NFT Marketplace",
                        description: "Your place to trade music NFTs",
                        icon: "https://near.org/wp-content/uploads/2020/09/cropped-favicon-192x192.png",
                    },
                }),
            ],
        });
        const _modal = setupModal(_selector, { contractId: CONTRACT_ID });
        const state = _selector.store.getState();
        const _accounts = state.accounts;

        // window.selector = _selector;
        // window.modal = _modal;

        setSelector(_selector);
        setModal(_modal);
        setAccounts(_accounts);
    }, []);

    useEffect(() => {
        init().catch((err) => {
            console.error(err);
            alert("Failed to initialise wallet selector");
        });
    }, [init]);

    useEffect(() => {
        if (!selector) {
            return;
        }

        const accountId = accounts.find((a) => a.active)?.accountId || null;
        if (!accountId) {
            setAccount(null);
            setLoading(false);
            return;
        }

        Promise
            .all([
                viewAccount({ selector: selector, accountId: accountId }),
                getEneftigoCollectibles({ 
                    selector: selector, 
                    contractId: "nft." + CONTRACT_ID, 
                    accountId: accountId,
                }),
                getStorageDeposit({
                    selector: selector,
                    contractId: CONTRACT_ID,
                    accountId: accountId,
                })
            ])
            .then((values) => {
                const accountData = values[0];
                const _account = { 
                    account_id: accountId, 
                    ...accountData, 
                };
                setAccount(_account);
                setLoading(false);
                setCollectibles(values[1]);
                setDeposit(values[2]);
            });
    }, [selector, accounts]);

    useEffect(() => {
        if (!selector) {
            return;
        }

        const subscription = selector.store.observable
            .pipe(
                map((state) => state.accounts),
                distinctUntilChanged()
            )
            .subscribe((nextAccounts) => {
                setAccounts(nextAccounts);
            });

        return () => subscription.unsubscribe();
    }, [selector]);

    if (!selector || !modal) {
        return null;
    }

    const contractId = CONTRACT_ID;
    
    return (
        <EneftigoContext.Provider
            value={{
                loading,
                contractId,
                selector,
                modal,
                accounts,
                account,
                collectibles,
                deposit,
                setAccount,
                setDeposit,
            }}>
            <Content />
        </EneftigoContext.Provider>
    );
}

export function useEneftigoContext() {
    const context = useContext(EneftigoContext);

    if (!context) {
        throw new Error(
            "useEneftigoContext must be used within a EneftigoContextProvider"
        );
    }

    return context;
}