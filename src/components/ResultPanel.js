
import React from 'react';

const ResultPanel = ({ mintResult, isVisible }) => {
  if (!isVisible) return null;

  const { mintAddress, metadata, signature } = mintResult || {};

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="result-panel">
      <h3>Output</h3>
      
      <div className="result-section">
        <div className="result-title">
          New Mint Address
          <button 
            className="copy-button" 
            onClick={() => copyToClipboard(mintAddress)}
          >
            Copy
          </button>
        </div>
        <div className="result-content">{mintAddress || 'N/A'}</div>
      </div>
      
      <div className="result-section">
        <div className="result-title">Submitted Metadata</div>
        <div className="result-content">
          {metadata ? (
            <pre>{JSON.stringify(metadata, null, 2)}</pre>
          ) : (
            'N/A'
          )}
        </div>
      </div>
      
      <div className="result-section">
        <div className="result-title">
          Transaction Signatures
          <button 
            className="copy-button" 
            onClick={() => copyToClipboard(signature)}
          >
            Copy
          </button>
        </div>
        <div className="result-content">{signature || 'N/A'}</div>
      </div>
      
      <div className="explorer-links">
        {mintAddress && (
          <button 
            onClick={() => window.open(`https://solscan.io/token/${mintAddress}`, '_blank')}
            className="explorer-button"
          >
            View Token on Solscan
          </button>
        )}
        
        {signature && (
          <button 
            onClick={() => window.open(`https://explorer.solana.com/tx/${signature}`, '_blank')}
            className="explorer-button"
          >
            View Transaction on Explorer
          </button>
        )}
      </div>
    </div>
  );
};

export default ResultPanel;
