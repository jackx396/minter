import { Transaction, SystemProgram, Keypair, PublicKey, TransactionInstruction, ComputeBudgetProgram } from '@solana/web3.js';
import { 
  createInitializeMintInstruction, 
  getMinimumBalanceForRentExemptMint, 
  MINT_SIZE, 
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createMintToInstruction,
  createSetAuthorityInstruction,
  AuthorityType
} from '@solana/spl-token';

const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// Simple working metadata instruction
const createMetadataInstruction = (accounts, data) => {
  const keys = [
    { pubkey: accounts.metadata, isSigner: false, isWritable: true },
    { pubkey: accounts.mint, isSigner: false, isWritable: false },
    { pubkey: accounts.mintAuthority, isSigner: true, isWritable: false },
    { pubkey: accounts.payer, isSigner: true, isWritable: true },
    { pubkey: accounts.updateAuthority, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: new PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false },
  ];

  // Simple data format that works
  const nameLen = Math.min(data.name.length, 32);
  const symbolLen = Math.min(data.symbol.length, 10);
  const uriLen = Math.min(data.uri.length, 200);
  
  const instructionData = Buffer.concat([
    Buffer.from([33]), // CreateMetadataAccountV3
    // Data struct
    Buffer.from([nameLen, 0, 0, 0]),
    Buffer.from(data.name.slice(0, nameLen), 'utf8'),
    Buffer.from([symbolLen, 0, 0, 0]),
    Buffer.from(data.symbol.slice(0, symbolLen), 'utf8'),
    Buffer.from([uriLen, 0, 0, 0]),
    Buffer.from(data.uri.slice(0, uriLen), 'utf8'),
    Buffer.from([0, 0]), // seller_fee_basis_points
    Buffer.from([0]), // creators (none)
    Buffer.from([0]), // collection (none)
    Buffer.from([0]), // uses (none)
    Buffer.from([0]), // is_mutable (false)
    Buffer.from([0]), // collection_details (none)
  ]);

  return new TransactionInstruction({
    keys,
    programId: TOKEN_METADATA_PROGRAM_ID,
    data: instructionData,
  });
};

export const createCompleteToken = async (connection, wallet, tokenData) => {
  try {
    const mintKeypair = Keypair.generate();
    
    // Get recent blockhash first
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    const associatedTokenAccount = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      wallet.publicKey
    );
    
    const supplyAmount = BigInt(tokenData.supply) * BigInt(10 ** tokenData.decimals);
    
    const transaction = new Transaction();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Add optimized compute budget for lower fees
    transaction.add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 200000 })
    );
    transaction.add(
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 500 })
    );
    
    // Step 1: Create mint account
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      })
    );
    
    // Step 2: Initialize mint
    transaction.add(
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        tokenData.decimals,
        wallet.publicKey,
        wallet.publicKey
      )
    );
    
    // Step 3: Create metadata if URI provided
    if (tokenData.metadataUri) {
      const [metadataAccount] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintKeypair.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );
      
      transaction.add(
        createMetadataInstruction(
          {
            metadata: metadataAccount,
            mint: mintKeypair.publicKey,
            mintAuthority: wallet.publicKey,
            payer: wallet.publicKey,
            updateAuthority: wallet.publicKey,
          },
          {
            name: tokenData.name || 'Token',
            symbol: tokenData.symbol || 'TKN',
            uri: tokenData.metadataUri,
          }
        )
      );
    }
    
    // Step 4: Create token account
    transaction.add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        associatedTokenAccount,
        wallet.publicKey,
        mintKeypair.publicKey
      )
    );
    
    // Step 5: Mint supply
    transaction.add(
      createMintToInstruction(
        mintKeypair.publicKey,
        associatedTokenAccount,
        wallet.publicKey,
        supplyAmount
      )
    );
    
    // Step 6: Revoke mint authority
    transaction.add(
      createSetAuthorityInstruction(
        mintKeypair.publicKey,
        wallet.publicKey,
        AuthorityType.MintTokens,
        null
      )
    );
    
    // Step 7: Revoke freeze authority
    transaction.add(
      createSetAuthorityInstruction(
        mintKeypair.publicKey,
        wallet.publicKey,
        AuthorityType.FreezeAccount,
        null
      )
    );
    
    // Skip simulation - proceed directly to transaction
    
    // Send transaction
    const signature = await wallet.sendTransaction(transaction, connection, {
      signers: [mintKeypair],
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });
    
    return {
      mintAddress: mintKeypair.publicKey.toBase58(),
      tokenAccount: associatedTokenAccount.toBase58(),
      signature
    };
    
  } catch (error) {
    throw new Error(`Token creation failed: ${error.message}`);
  }
};