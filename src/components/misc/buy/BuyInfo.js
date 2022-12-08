import { EneftigoModal } from 'EneftigoModal';

export function BuyInfo({ open, handleClose }) {

    const content =
        <div style={{ margin: "16px 32px 32px 32px" }}>
            <BuyInfoContent />
        </div>;

    return (
        <>
            <EneftigoModal
                open={open}
                title="NFT PURCHASE HELP"
                handleClose={handleClose}
                content={content}
            />
        </>
    );
}

function BuyInfoContent() {
    return (
        <div>
            <p style={{ width: "600px", textAlign: 'justify', fontSize: 'var(--eneftigo-font-size-small)' }}>
                UNDER CONSTRUCTION
            </p>
        </div >
    );
}
