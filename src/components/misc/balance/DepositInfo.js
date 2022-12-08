import { EneftigoModal } from 'EneftigoModal';

export function DepositInfo({ open, handleClose }) {

    const content =
        <div style={{ margin: "16px 32px 32px 32px" }}>
            <DepositInfoContent />
        </div>;

    return (
        <>
            <EneftigoModal
                open={open}
                title="NEAR STORAGE DEPOSITS"
                handleClose={handleClose}
                content={content}
            />
        </>
    );
}

function DepositInfoContent() {
    return (
        <div>
            <p style={{ width: "600px", textAlign: 'justify', fontSize: 'var(--eneftigo-font-size-small)' }}>
                Eneftigo marketplace runs fully on-chain. What this means is that not only the NFT ownership but every marketplace transaction, be it a purchase, sale or a price offer placed gets stored in the blockchain. You don't need to trust any record keeper and you get the ultimate transparency only true Web3 solution can offer.<br />
                This comes it a cost. Every piece of information stored in the blockchain is replicated across all network participants (validators) who put their resources at your disposal.
                To not overuse the storage validators make available to you Near requires a small deposit for every byte of data stored.<br />
                Deposit gets returned when storage is freed so don't worry, you will get your money back sonner or later unless you're buying an NFT which you want to be there till the end of time. Even then you shouldn't worry too much because Near storage deposit is very affordable and you only pay it once.
            </p>
        </div >
    );
}
