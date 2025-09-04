
import React from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import components
import Header from './components/Header';
import TokenForm from './components/TokenForm';
import AccessGuard from './components/WalletGuard';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

const App = () => {
  // Use Solana mainnet with reliable RPC
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = process.env.REACT_APP_RPC_ENDPOINT || 'https://holy-neat-season.solana-mainnet.quiknode.pro/86d7ca3d0d4f68cdf73254d9e9d167895864f480/';
  
  // Initialize wallet adapters
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AccessGuard>
            <div className="container">
              <Header />
              <main className="main">
                <TokenForm />
              </main>
            </div>
          </AccessGuard>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
