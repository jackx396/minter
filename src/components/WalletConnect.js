import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';

const WalletConnect = () => {
  const { connected } = useWallet();

  return (
    <div className="wallet-buttons">
      {connected ? (
        <WalletDisconnectButton />
      ) : (
        <WalletMultiButton />
      )}
    </div>
  );
};

export default WalletConnect;
