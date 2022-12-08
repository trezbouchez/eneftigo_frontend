import { useEneftigoContext } from 'EneftigoContext';
import { useState } from 'react';
import { DEPOSIT_MIN_YOCTO, BALANCE_MIN_YOCTO } from 'constants';
import { BuyDetails } from './BuyDetails';
import { BalanceInsufficient } from 'components/misc/balance/BalanceInsufficient';
import { DepositInsufficient } from 'components/misc/balance/DepositInsufficient';

const Modal = {
  BUY: 0,
  INSUFFICIENT_BALANCE: 1,
  INSUFFICIENT_DEPOSIT: 2,
};

export function Buy({ listing }) {
  const { account, deposit } = useEneftigoContext();
  const [modal, setModal] = useState(null);

  const balanceSufficient = BigInt(account.amount) >= (BigInt(listing.price_yocto) + BALANCE_MIN_YOCTO);
  const depositSufficient = deposit[0] >= DEPOSIT_MIN_YOCTO;

  const handleOpen = () => {
    if (!balanceSufficient) {
      setModal(Modal.INSUFFICIENT_BALANCE);
    } else if (!depositSufficient) {
      setModal(Modal.INSUFFICIENT_DEPOSIT);
    } else {
      setModal(Modal.BUY);
    }
  };

  return (
    <>
      <button style={{ width: "60px" }} className="listing_buy_thumb" onClick={handleOpen}>
        BUY
      </button>
      <BuyDetails
        listing={listing}
        open={modal === Modal.BUY}
        handleClose={() => setModal(null)}
      />
      <BalanceInsufficient 
        open={modal === Modal.INSUFFICIENT_BALANCE}
        handleClose={() => setModal(null)}
        priceToPayYocto={listing.price_yocto}
      />
      <DepositInsufficient 
        open={modal === Modal.INSUFFICIENT_DEPOSIT}
        handleClose={() => setModal(null)}
      />
    </>
  );
}
