import { EneftigoModal } from 'EneftigoModal';

export function BidInfo({ open, handleClose }) {

    const content =
        <div style={{ margin: "16px 32px 32px 32px" }}>
            <BidInfoContent />
        </div>;

    return (
        <>
            <EneftigoModal
                open={open}
                title="NFT BIDDING HELP"
                handleClose={handleClose}
                content={content}
            />
        </>
    );
}

function BidInfoContent() {
    return (
        <div>
            <p style={{ width: "600px", textAlign: 'justify', fontSize: 'var(--eneftigo-font-size-small)' }}>
                UNDER CONSTRUCTION
            </p>
        </div >
    );
}
