import React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
};

export default function TransactionResult() {
    const urlParams = new URLSearchParams(window.location.search);
    // the current version of Near Wallet is using 'signMeta' query parameter name
    // for wallet meta passed to the transaction; this seems to be a bug, we anticipate
    // this to change to plain 'meta' at some point, so we check both to be future-proof
    let meta = urlParams.get('signMeta');
    if (meta === null) {
      meta = urlParams.get('meta');
    }
    let errorCode = urlParams.get('errorCode');
    let errorMessage = urlParams.get('errorMessage');
    let transactionHashes = urlParams.get('transactionHashes');

    let transactionName;
    if (meta == "primary_listing_buy") {
        transactionName = "Purchase";
    } else {
        transactionName = "Transaction";
    }

    if (errorCode === "userRejected") {
        return (
            <>
                <TransactionCancelled transactionName={transactionName} />
            </>
        );
    } else if (errorCode !== null) {
        return (
            <>
                <TransactionFailed transactionName={transactionName} errorCode={errorCode} errorMessage={errorMessage} />
            </>
        );
    } else if (transactionHashes !== null) {
        const firstHash = transactionHashes.split(",")[0]
        return (
            <>
                <TransactionSucceeded transactionName={transactionName} transactionHash={firstHash} />
            </>
        );
    }
}


function TransactionCancelled({ transactionName }) {
    const [open, setOpen] = React.useState(true);

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="buy-modal-title"
                aria-describedby="buy-modal-description"
            >
                <Box sx={{ ...style, width: 600, borderRadius: "10px" }}>
                    <h2 id="buy-modal-title">{transactionName} Aborted</h2>
                    <p style={{ textAlign: 'center' }} id="buy-modal-description">
                        Your transaction was cancelled.
                    </p>
                    <div className="flex-container" style={{ justifyContent: "space-evenly" }}>
                        <button style={{ width: "100px" }} className="cancel" onClick={handleClose}>CLOSE</button>
                    </div>
                </Box>
            </Modal>
        </>
    );
}

function TransactionFailed({ transactionName, errorCode, errorMessage }) {
    const [open, setOpen] = React.useState(true);

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="buy-modal-title"
                aria-describedby="buy-modal-description"
            >
                <Box sx={{ ...style, width: 600, borderRadius: "10px" }}>
                    <h2 id="buy-modal-title">{transactionName} Failed</h2>
                    <p style={{ textAlign: 'center' }} id="buy-modal-description">
                        Your transaction did not complete.
                    </p>
                    <div className="flex-container" style={{ justifyContent: "space-evenly" }}>
                        <button style={{ width: "100px" }} className="cancel" onClick={handleClose}>CLOSE</button>
                    </div>
                </Box>
            </Modal>
        </>
    );
}

function TransactionSucceeded({ transactionName, transactionHash }) {
    const [open, setOpen] = React.useState(true);

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="buy-modal-title"
                aria-describedby="buy-modal-description"
            >
                <Box sx={{ ...style, width: 600, borderRadius: "10px" }}>
                    <h2 id="buy-modal-title">{transactionName} Succeeded!</h2>
                    <p style={{ textAlign: 'center' }} id="buy-modal-description">
                        Your transaction was processed successfully.
                    </p>
                    <p style={{ color:'#aaaaaa', textAlign: 'center' }} id="buy-modal-description">
                        Transaction hash: { transactionHash }
                    </p>
                    <div className="flex-container" style={{ justifyContent: "space-evenly" }}>
                        <button style={{ width: "100px" }} className="cancel" onClick={handleClose}>CLOSE</button>
                    </div>
                </Box>
            </Modal>
        </>
    );
}
