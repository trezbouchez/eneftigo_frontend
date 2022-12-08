import { EneftigoModal } from 'EneftigoModal';

export function BalanceInfo({ open, handleClose }) {

    const content =
        <div style={{ margin: "16px 32px 32px 32px" }}>
            <BalanceInfoContent />
        </div>;

    return (
        <>
            <EneftigoModal
                open={open}
                title="WALLET BALANCE"
                handleClose={handleClose}
                content={content}
            />
        </>
    );
}

function BalanceInfoContent() {
    return (
        <div>
            <p style={{ width: "600px", textAlign: 'justify', fontSize: 'var(--eneftigo-font-size-small)' }}>
                UNDER CONSTRUCTION
            </p>
        </div >
    );
}
