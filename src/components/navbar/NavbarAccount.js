import { useState } from "react";
import { useEneftigoContext } from "EneftigoContext";
import { Menu, MenuItem } from '@mui/material';

export function NavbarAccount() {
    const [anchorEl, setAnchorEl] = useState(null);
    const { account, accounts, selector } = useEneftigoContext();

    const handleClick = (event) => {
        if (accounts.length > 1) {
            setAnchorEl(event.currentTarget);
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSignIn = async () => {
        const wallet = await selector.wallet();
        const res = wallet.signIn();
        // .then((wallet) => {
        //     wallet.signIn({ /*contractId: contractId*/ });
        // });

        // const result = await wallet.verifyOwner({ message: "wiadomosc"});

        // modal.show();
    }

    return (
        <div>
            <p onClick={handleClick}>{account.account_id}</p>
            {/* <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
                {account.account_id}
            </Button> */}
            <Menu
                id="account-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {accounts.map((a) => (
                    <MenuItem
                        key={a.accountId}
                        // selected={a.accountId === account.account_id}
                        onClick={handleClose}
                    >
                        {a.accountId}
                    </MenuItem>
                ))}
                <hr></hr>
                <MenuItem onClick={handleSignIn}><button className="listing_buy_thumb">SIGN IN TO ANOTHER ACCOUNT</button></MenuItem>
            </Menu>
        </div>
    );
}
