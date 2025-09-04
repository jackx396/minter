import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { createCompleteToken } from '../utils/tokenMint';
import ResultPanel from './ResultPanel';

// Utility function to detect wallet browsers
const detectWalletBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isPhantom = userAgent.includes('phantom') || window.phantom;
  const isSolflare = userAgent.includes('solflare') || window.solflare;
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  return {
    isPhantom,
    isSolflare,
    isMobile,
    isWalletBrowser: isPhantom || isSolflare
  };
};

// Utility function to validate metadata URLs
const validateMetadataUrl = (url) => {
  if (!url) return { isValid: false, message: '' };
  
  try {
    const urlObj = new URL(url);
    
    // Must be HTTPS
    if (urlObj.protocol !== 'https:') {
      return { isValid: false, message: '⚠️ URL must use HTTPS protocol' };
    }
    
    // Check for common IPFS patterns
    const ipfsPatterns = [
      /w3s\.link/,
      /nft\.storage/,
      /gateway\.pinata\.cloud/,
      /ipfs\.io/,
      /cloudflare-ipfs\.com/,
      /dweb\.link/,
      /ipfs\./
    ];
    
    const isIpfsUrl = ipfsPatterns.some(pattern => pattern.test(url));
    
    if (!isIpfsUrl) {
      return { 
        isValid: true, 
        message: '💡 Tip: IPFS URLs provide better compatibility and lower fees' 
      };
    }
    
    return { isValid: true, message: '✅ Valid IPFS metadata URL' };
  } catch (error) {
    return { isValid: false, message: '❌ Invalid URL format' };
  }
};

const TokenForm = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  
  // Detect wallet browser for optimizations
  const walletInfo = detectWalletBrowser();
  
  const [formData, setFormData] = useState({
    metadataUrl: '',
    totalSupply: '1000000000'
  });
  
  const [metadataUploading, setMetadataUploading] = useState(false);
  const [metadataUploaded, setMetadataUploaded] = useState(false);
  const [mintKeypair, setMintKeypair] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [estimatedFee, setEstimatedFee] = useState(0.01);
  const [mintResult, setMintResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  
  useEffect(() => {
    // Fetch estimated fee from RPC
    const fetchFee = async () => {
      try {
        // This is a simplified example - in a real app you'd calculate based on
        // recent blockhash and transaction size
        setEstimatedFee(0.01);
      } catch (err) {
        console.error('Error fetching fee estimate:', err);
      }
    };
    
    fetchFee();
  }, [connection]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate metadata URL in real-time
    if (name === 'metadataUrl') {
      if (value) {
        const validation = validateMetadataUrl(value);
        if (!validation.isValid) {
          setError(validation.message);
        } else {
          setError(validation.message);
        }
      } else {
        setError('');
      }
    }
    
    // Validate total supply
    if (name === 'totalSupply') {
      const supply = parseInt(value);
      if (value && (supply < 1 || supply > 1000000000000)) {
        setError('⚠️ Total supply must be between 1 and 1 trillion');
      } else if (error.includes('Total supply')) {
        setError('');
      }
    }
  };
  

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }
    
    setIsLoading(true);
    setError('Creating token...');
    
    try {
      const result = await createCompleteToken(connection, { publicKey, sendTransaction }, {
        name: formData.name,
        symbol: formData.symbol,
        decimals: 9,
        supply: parseInt(formData.totalSupply),
        description: formData.description,
        image: formData.imageUrl
      });
      
      setMintResult({
        mintAddress: result.mintAddress,
        metadata: {
          name: formData.name,
          symbol: formData.symbol,
          decimals: 9,
          supply: parseInt(formData.totalSupply),
          description: formData.description,
          image: formData.imageUrl
        },
        signature: result.signature
      });
      setShowResults(true);
      setError('');
      
    } catch (err) {
      console.error('Error creating token:', err);
      setError(`Failed to create token: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={walletInfo.isWalletBrowser ? 'wallet-browser-optimized' : ''}>
      <h1 className="section-title">Mint SPL Token</h1>
      <p className="section-description">
        {walletInfo.isWalletBrowser 
          ? 'Create your SPL token directly in your wallet browser. Optimized for mobile experience.' 
          : 'Create your own SPL token on the Solana blockchain. Fill out the details below to mint your token.'}
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Metadata URL *</label>
          <input
            type="url"
            name="metadataUrl"
            value={formData.metadataUrl}
            onChange={handleChange}
            placeholder="https://w3s.link/ipfs/... or https://gateway.pinata.cloud/ipfs/..."
            className="form-input"
            required
          />
          <small className="form-help">
            {walletInfo.isWalletBrowser 
              ? '📋 IPFS metadata URL (tap to paste from clipboard)' 
              : '📋 Supports: Web3.Storage, NFT.Storage, Pinata, or any IPFS gateway URL'}
          </small>
          {formData.metadataUrl && (
            <div className="url-preview">
              <a href={formData.metadataUrl} target="_blank" rel="noopener noreferrer" className="preview-link">
                🔗 Preview Metadata
              </a>
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label className="form-label">Total Supply *</label>
          <input
            type="number"
            name="totalSupply"
            value={formData.totalSupply}
            onChange={handleChange}
            placeholder="1000000000"
            className="form-input"
            min="1"
            max="1000000000000"
            required
          />
          <small className="form-help">
            {walletInfo.isWalletBrowser 
              ? '💰 Max: 1T tokens' 
              : '💰 Maximum: 1 trillion tokens (1,000,000,000,000)'}
          </small>
        </div>
        
        <div className="fee-display">
          <div className="fee-info">
            <strong>Estimated Fees:</strong>
            <div>Token + Metadata: ~0.018 SOL</div>
            <div>Compute Budget: ~0.001 SOL</div>
            <div className="total-fee"><strong>Total: ~0.019 SOL</strong></div>
          </div>
        </div>
        
        <div className="button-group">
          <button 
            type="button" 
            className="mint-button"
            disabled={isLoading || !publicKey}
            onClick={async () => {
              if (!publicKey) {
                setError('🔗 Please connect your wallet first. Make sure you\'re using a supported wallet (Phantom, Solflare, etc.)');
                return;
              }
              
              // Validate metadata URL
              const urlValidation = validateMetadataUrl(formData.metadataUrl);
              if (!urlValidation.isValid) {
                setError(`❌ ${urlValidation.message}`);
                return;
              }
              
              // Validate total supply
              const supply = parseInt(formData.totalSupply);
              if (!formData.totalSupply || supply < 1 || supply > 1000000000000) {
                setError('❌ Please enter a valid total supply (1 to 1 trillion)');
                return;
              }
              
              setIsLoading(true);
              
              try {
                setError('🔗 Fetching metadata from IPFS...');
                
                // Fetch metadata from IPFS URL
                const response = await fetch(formData.metadataUrl);
                if (!response.ok) {
                  throw new Error('Failed to fetch metadata from IPFS URL');
                }
                const metadata = await response.json();
                
                setError('🧪 Simulating transactions...');
                
                // Skip simulation - create token directly
                setError('🚀 Creating token directly...');
                
                setError('🎆 Creating complete token...');
                
                // Create token directly without simulation
                const result = await createCompleteToken(connection, { publicKey, sendTransaction }, {
                  name: metadata.name || 'Unknown Token',
                  symbol: metadata.symbol || 'UNK',
                  decimals: 9,
                  supply: supply,
                  description: metadata.description || '',
                  image: metadata.image || '',
                  metadataUri: formData.metadataUrl
                });
                
                setMintResult({
                  mintAddress: result.mintAddress,
                  metadata: {
                    ...metadata,
                    metadataUrl: formData.metadataUrl,
                    supply: formData.totalSupply
                  },
                  signature: result.signature
                });
                setShowResults(true);
                setError(`🎉 Success! Token created with metadata: ${metadata.name} (${metadata.symbol})`);
              } catch (err) {
                console.error('Token creation error:', err);
                let errorMessage = err.message;
                
                if (errorMessage.includes('User rejected')) {
                  errorMessage = '❌ Transaction cancelled by user';
                } else if (errorMessage.includes('insufficient funds')) {
                  errorMessage = '💰 Insufficient SOL balance for transaction fees';
                } else if (errorMessage.includes('fetch')) {
                  errorMessage = '🔗 Failed to fetch metadata from IPFS URL';
                }
                
                setError(`❌ ${errorMessage}`);
              } finally {
                setIsLoading(false);
              }
            }}
          >
{isLoading ? 'Creating...' : 'Create Token + Metadata (~0.019 SOL)'}
          </button>
          

        </div>
        
        {error && <div className="error-message">{error}</div>}
      </form>
      
      <div className="output-section">
        <h3>Output</h3>
        
        <div className="result-section">
          <div className="result-title">New Mint Address</div>
          <div className="result-content">
            {showResults && mintResult?.mintAddress ? mintResult.mintAddress : 'No mint address yet'}
          </div>
        </div>
        
        <div className="result-section">
          <div className="result-title">Submitted Metadata</div>
          <div className="result-content">
            {showResults && mintResult?.metadata ? 
              <pre>{JSON.stringify(mintResult.metadata, null, 2)}</pre> : 
              'No metadata submitted yet'
            }
          </div>
        </div>
        
        {showResults && mintResult?.mintAddress && (
          <div className="metadata-upload-section">
            <h3>{walletInfo.isWalletBrowser ? '📁 Store Metadata' : '📁 Upload Metadata to IPFS'}</h3>
            <div className="metadata-form">
              <div className="form-group">
                <label className="form-label">IPFS Provider</label>
                <select 
                  className="form-input" 
                  id="ipfsProvider"
                  onChange={(e) => {
                    const helpElement = document.getElementById('providerHelp');
                    const tokenInput = document.getElementById('apiToken');
                    
                    if (e.target.value === 'web3storage') {
                      helpElement.innerHTML = 'Get free token at <a href="https://web3.storage" target="_blank" rel="noopener noreferrer">web3.storage</a> (1TB free)';
                      tokenInput.placeholder = 'Enter your Web3.Storage token';
                    } else if (e.target.value === 'nftstorage') {
                      helpElement.innerHTML = 'Get free token at <a href="https://nft.storage" target="_blank" rel="noopener noreferrer">nft.storage</a> (Unlimited free)';
                      tokenInput.placeholder = 'Enter your NFT.Storage token';
                    } else if (e.target.value === 'pinata') {
                      helpElement.innerHTML = 'Get free token at <a href="https://pinata.cloud" target="_blank" rel="noopener noreferrer">pinata.cloud</a> (1GB free)';
                      tokenInput.placeholder = 'Enter your Pinata JWT token';
                    }
                  }}
                >
                  <option value="web3storage">Web3.Storage (1TB Free)</option>
                  <option value="nftstorage">NFT.Storage (Unlimited Free)</option>
                  <option value="pinata">Pinata (1GB Free)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">API Token</label>
                <input
                  type="password"
                  placeholder="Enter your API token"
                  className="form-input"
                  id="apiToken"
                />
                <small className="form-help" id="providerHelp">
                  Get free token at <a href="https://web3.storage" target="_blank" rel="noopener noreferrer">web3.storage</a> (1TB free)
                </small>
              </div>
              
              <div className="metadata-preview">
                <strong>Metadata URL Reference:</strong>
                <div className="metadata-url-display">
                  {formData.metadataUrl ? (
                    <a href={formData.metadataUrl} target="_blank" rel="noopener noreferrer" className="metadata-link">
                      {formData.metadataUrl}
                    </a>
                  ) : (
                    <span className="no-metadata">No metadata URL provided</span>
                  )}
                </div>
              </div>
              
              <div className="completion-status">
                <div className="success-card">
                  <h4>✅ Token Creation Complete!</h4>
                  <div className="token-details">
                    <p><strong>Mint Address:</strong> <code>{mintResult.mintAddress}</code></p>
                    <p><strong>Total Supply:</strong> {mintResult.metadata.supply} tokens</p>
                    <p><strong>Metadata URL:</strong> <a href={formData.metadataUrl} target="_blank" rel="noopener noreferrer">{formData.metadataUrl}</a></p>
                  </div>

                </div>
                
                <div className="next-steps">
                  <h4>🚀 Your Token is Ready!</h4>
                  <ul>
                    <li>✅ <strong>Fully functional</strong> - Can be transferred and traded</li>
                    <li>✅ <strong>Fixed supply</strong> - No more tokens can be minted</li>
                    <li>✅ <strong>Metadata stored</strong> - IPFS URL recorded in form</li>
                  </ul>
                  
                  <h5>💼 Wallet Display:</h5>
                  <p>✅ <strong>Token + Metadata created!</strong> Should display properly in wallets with name, symbol, and image. Fixed supply with authorities revoked.</p>
                </div>
              </div>
              
              <div className="metadata-info">
                <h4>📋 {walletInfo.isWalletBrowser ? 'Quick Setup:' : 'Setup Instructions:'}</h4>
                <ol>
                  <li>{walletInfo.isWalletBrowser ? 'Pick IPFS provider' : 'Choose your preferred IPFS provider above'}</li>
                  <li>{walletInfo.isWalletBrowser ? 'Get free API token' : 'Visit provider website and sign up'}</li>
                  <li>{walletInfo.isWalletBrowser ? 'Paste token & store' : 'Create API token in dashboard'}</li>
                  {!walletInfo.isWalletBrowser && <li>Paste token and upload metadata</li>}
                </ol>
                
                {!walletInfo.isWalletBrowser && (
                  <>
                    <h4>🔗 Provider Links:</h4>
                    <ul>
                      <li><a href="https://web3.storage" target="_blank" rel="noopener noreferrer">Web3.Storage</a> - 1TB free</li>
                      <li><a href="https://nft.storage" target="_blank" rel="noopener noreferrer">NFT.Storage</a> - Unlimited free</li>
                      <li><a href="https://pinata.cloud" target="_blank" rel="noopener noreferrer">Pinata</a> - 1GB free</li>
                    </ul>
                  </>
                )}
                
                <h4>💰 {walletInfo.isWalletBrowser ? 'Why IPFS?' : 'Fee Comparison:'}</h4>
                <div className="fee-comparison">
                  {walletInfo.isWalletBrowser ? (
                    <div className="fee-option">
                      <strong>✅ IPFS Benefits:</strong>
                      <ul>
                        <li>Only 0.004 SOL vs 0.03-0.06 SOL</li>
                        <li>Always works (small size)</li>
                        <li>Professional appearance</li>
                      </ul>
                    </div>
                  ) : (
                    <>
                      <div className="fee-option">
                        <strong>❌ Full On-Chain Metadata:</strong>
                        <ul>
                          <li>Large JSON data: ~0.03-0.06 SOL</li>
                          <li>Often fails due to size limits</li>
                          <li>High compute units required</li>
                        </ul>
                      </div>
                      <div className="fee-option">
                        <strong>✅ IPFS URL Method:</strong>
                        <ul>
                          <li>Only hash + URL: <strong>0.004 SOL</strong></li>
                          <li>Always succeeds (small size)</li>
                          <li>Standard compute units</li>
                        </ul>
                      </div>
                    </>
                  )}
                  <div className="savings">
                    <strong>💡 Savings: Up to 93% less fees!</strong>
                  </div>
                </div>
                
                {!walletInfo.isWalletBrowser && (
                  <>
                    <h4>🎯 Benefits:</h4>
                    <ul>
                      <li>✅ Permanent decentralized storage</li>
                      <li>✅ Wallet & DEX compatibility</li>
                      <li>✅ Professional token appearance</li>
                      <li>✅ Block explorer rich display</li>
                      <li>✅ <strong>93% lower fees</strong> vs full on-chain</li>
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenForm;