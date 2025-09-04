// IPFS Metadata Storage Utility
// Usage: uploadTokenMetadataToIPFS(tokenData, connection, wallet)

import { Transaction, TransactionInstruction, ComputeBudgetProgram, PublicKey } from '@solana/web3.js';

/**
 * Upload token metadata to IPFS and store reference on Solana blockchain
 * @param {Object} tokenData - Token information
 * @param {Connection} connection - Solana connection
 * @param {Object} wallet - Wallet with publicKey and sendTransaction
 * @param {string} pinataJWT - Your Pinata JWT token
 * @returns {Promise<Object>} Result with IPFS hash and URL
 */
export async function uploadTokenMetadataToIPFS(tokenData, connection, wallet, pinataJWT) {
  try {
    // Step 1: Create metadata JSON
    const metadata = {
      name: tokenData.name,
      symbol: tokenData.symbol,
      description: tokenData.description || '',
      image: tokenData.image || '',
      external_url: tokenData.website || '',
      attributes: [
        { trait_type: "Supply", value: tokenData.supply || "0" },
        { trait_type: "Decimals", value: tokenData.decimals || 9 },
        { trait_type: "Mint", value: tokenData.mintAddress || "" }
      ]
    };

    // Step 2: Upload to IPFS via Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pinataJWT}`
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `${tokenData.name}_metadata.json`,
          keyvalues: {
            token: tokenData.mintAddress || 'unknown',
            type: 'token_metadata'
          }
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`IPFS upload failed: ${error}`);
    }

    const ipfsResult = await response.json();
    const ipfsHash = ipfsResult.IpfsHash;
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    // Step 3: Store IPFS reference on Solana blockchain
    const tx = new Transaction()
      .add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 15000 }))
      .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 250000 }))
      .add(
        new TransactionInstruction({
          keys: [{ pubkey: wallet.publicKey, isSigner: true, isWritable: false }],
          programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
          data: Buffer.from(`IPFS_METADATA:${ipfsHash}|${ipfsUrl}|${tokenData.mintAddress || ''}`, 'utf8'),
        })
      );

    const signature = await wallet.sendTransaction(tx, connection);

    return {
      success: true,
      ipfsHash,
      ipfsUrl,
      signature,
      metadata
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Simple metadata storage (fallback option)
 * @param {Object} tokenData - Token information  
 * @param {Connection} connection - Solana connection
 * @param {Object} wallet - Wallet with publicKey and sendTransaction
 * @returns {Promise<Object>} Result with transaction signature
 */
export async function storeSimpleMetadata(tokenData, connection, wallet) {
  try {
    const metadataText = `${tokenData.name}|${tokenData.symbol}|${tokenData.mintAddress}|${tokenData.image || ''}|${tokenData.description || ''}`;
    
    const tx = new Transaction()
      .add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 15000 }))
      .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 250000 }))
      .add(
        new TransactionInstruction({
          keys: [{ pubkey: wallet.publicKey, isSigner: true, isWritable: false }],
          programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
          data: Buffer.from(`TOKEN_META:${metadataText}`, 'utf8'),
        })
      );
    
    const signature = await wallet.sendTransaction(tx, connection);
    
    return {
      success: true,
      signature,
      metadata: metadataText
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Example usage:
/*
import { uploadTokenMetadataToIPFS, storeSimpleMetadata } from './utils/ipfsMetadata.js';

const tokenData = {
  name: "MyToken",
  symbol: "MTK", 
  description: "My awesome token",
  image: "https://imgur.com/token.png",
  website: "https://mytoken.com",
  supply: "1000000000",
  decimals: 9,
  mintAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHU"
};

// Option 1: IPFS Upload
const result = await uploadTokenMetadataToIPFS(
  tokenData, 
  connection, 
  { publicKey, sendTransaction }, 
  'your_pinata_jwt_here'
);

// Option 2: Simple Metadata
const result = await storeSimpleMetadata(
  tokenData,
  connection,
  { publicKey, sendTransaction }
);
*/