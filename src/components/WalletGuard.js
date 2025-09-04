import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const AccessGuard = ({ children }) => {
  const { publicKey } = useWallet();
  
  // Authorized wallet addresses
  const ALLOWED_WALLETS = [
    'AECvV16me6SifGnNpSMxrF1thQSfyuQ2HzYjKztSAioA',
    '3cxvPCPVcJAHyzzVt2cK5So9tSZxaA7Hn4CpddVf4VtT',
    'CcKJXr9Rpa2ojwg4CrZWG9UsAF82j2mLqJhZrdPf3cNP',
    'HWSLfystSFZwtUZD1sPmz3RJ2dJZCbDFUNpwyTEEmtuF',
    'FHbYniPHnDGg8oaEZPLzFxBevRTRsbHTC2URQmQeNoMB',
    'EEVYvMhSw9HrTBEDH1XV75Z8nfeArvnH2zmgUS4uwmUs',
    '5qU9FC8aDJ3TZfsyKtPQxkhBM4EVB3Aj6AjSNj3pKXJ',
    'B6oMnfQVT7uZRiCN7LgriHYThsdTRQFwj6k8ZN6UnJPz',
    'G6hccAVM2Jg6WaKCiAcHFqQSNuL7b69b9poxvSC3wxQF',
    'AyMxA1m7NELrTnejSJgRYMkCrJxra2Q1GBGpxKU84bgy'
  ];
  
  // Step 1: Wallet connection check
  if (!publicKey) {
    return (
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0f0f0f',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)',
          padding: '50px',
          borderRadius: '15px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          border: '1px solid #333'
        }}>
          <h2 style={{ 
            color: '#fff', 
            marginBottom: '10px',
            fontSize: '28px'
          }}>🔒 Private Token Minter</h2>
          <p style={{ 
            color: '#888', 
            marginBottom: '30px',
            fontSize: '16px'
          }}>Connect your authorized wallet to continue</p>
          
          <div style={{ marginBottom: '30px' }}>
            <WalletMultiButton style={{
              backgroundColor: '#007bff',
              borderRadius: '8px',
              padding: '15px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer'
            }} />
          </div>
          
          <div style={{
            padding: '20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '10px',
            border: '1px solid #333'
          }}>
            <p style={{ color: '#888', fontSize: '14px', margin: '0' }}>
              ⚡ {ALLOWED_WALLETS.length} authorized wallet addresses<br/>
              🔄 Click above to connect your wallet
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Step 2: Wallet authorization check
  const isWalletAuthorized = ALLOWED_WALLETS.includes(publicKey.toBase58());
  
  if (!isWalletAuthorized) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px',
        backgroundColor: '#0f0f0f',
        color: '#fff',
        minHeight: '100vh'
      }}>
        <h2 style={{ color: '#ff4444', marginBottom: '20px' }}>🚫 Access Denied</h2>
        <p style={{ color: '#888', fontSize: '16px', marginBottom: '20px' }}>
          Your wallet is not authorized to use this token minter
        </p>
        
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '20px',
          borderRadius: '10px',
          display: 'inline-block',
          maxWidth: '600px',
          wordBreak: 'break-all'
        }}>
          <p style={{ color: '#888', fontSize: '14px', margin: '0 0 10px 0' }}>
            Connected wallet:
          </p>
          <code style={{ 
            color: '#ff6b6b', 
            backgroundColor: '#2a2a2a', 
            padding: '10px', 
            borderRadius: '5px',
            display: 'block',
            fontSize: '12px'
          }}>
            {publicKey.toBase58()}
          </code>
        </div>
        
        <div style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#1a1a1a',
          borderRadius: '8px',
          display: 'inline-block'
        }}>
          <p style={{ color: '#888', fontSize: '12px', margin: '0' }}>
            💡 Only {ALLOWED_WALLETS.length} specific wallets are authorized
          </p>
        </div>
      </div>
    );
  }
  
  // All checks passed - show the app
  return (
    <div>
      <div style={{
        backgroundColor: '#1a1a1a',
        padding: '10px',
        textAlign: 'center',
        borderBottom: '1px solid #333'
      }}>
        <span style={{ color: '#4CAF50', fontSize: '14px' }}>
          ✅ Authorized Access | Wallet: {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}
        </span>
      </div>
      {children}
    </div>
  );
};

export default AccessGuard;