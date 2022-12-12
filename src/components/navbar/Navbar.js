
import { useState } from "react";
import { Link, useMatch, useResolvedPath } from "react-router-dom";
import { SignOutButton } from 'components/login/SignInPrompt';
import eneftigo_logo from 'assets/eneftigo_logo.png';
import { useEneftigoContext } from "EneftigoContext";
import { Balance } from "components/misc/balance/Balance";
import { NavbarAccount } from "components/navbar/NavbarAccount";

const Modal = {
    MODAL_BALANCE: 0,
    MODAL_PLACE_DEPOSIT: 1,
    MODAL_WITHDRAW_DEPOSIT: 2,
};

export default function Navbar() {
    const { selector, account } = useEneftigoContext();
    const [modal, setModal] = useState(-1);

    const handleSignOut = async () => {
        const wallet = await selector.wallet();
        wallet.signOut().catch((err) => console.error("Failed to sign out" + err))
    };

    return (
        <nav className="nav" style={{ height: "64px", padding: "0px" }}>
            <ul>
                <Link to="/home" className="site-title" style={{ padding: "0px" }}>
                    <img src={require('assets/bracket_left.png')} alt="[" height="100%" style={{ margin: "0px 10px 0px 0px" }} />
                    <img src={eneftigo_logo} height="40" alt="" />
                </Link>
                <CustomLink className="page_link" to="/home">HOME</CustomLink>
                <CustomLink className="page_link" to="/discover">DISCOVER</CustomLink>
            </ul>
            <ul>
                <Balance
                    open={modal === Modal.MODAL_BALANCE}
                    handleShowModal={() => setModal(Modal.MODAL_BALANCE)}
                    handleHideModal={() => setModal(null)}
                    handlePlace={() => setModal(Modal.MODAL_PLACE_DEPOSIT)}
                    handleWithdraw={() => setModal(Modal.MODAL_WITHDRAW_DEPOSIT)}
                />
                <NavbarAccount />
                <SignOutButton accountId={account.account_id} onClick={handleSignOut} />
                <img src={require('assets/bracket_right.png')} alt="[" height="100%" style={{ margin: "0px 0px 0px 0px" }} />
            </ul>
        </nav>
    )
}

function CustomLink({ to, children, ...props }) {
    const resolvedPath = useResolvedPath(to)
    const isActive = useMatch({ path: resolvedPath.pathname, end: true })

    return (
        <li className={isActive ? "active" : ""}>
            <Link to={to} {...props}>
                {children}
            </Link>
        </li>
    )
}
