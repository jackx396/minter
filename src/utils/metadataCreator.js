import { Transaction, PublicKey, TransactionInstruction, ComputeBudgetProgram } from '@solana/web3.js';

const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

const createMetadataInstruction = (accounts, data) => {
  const keys = [
    { pubkey: accounts.metadata, isSigner: false, isWritable: true },
    { pubkey: accounts.mint, isSigner: false, isWritable: false },
    { pubkey: accounts.mintAuthority, isSigner: true, isWritable: false },
    { pubkey: accounts.payer, isSigner: true, isWritable: true },
    { pubkey: accounts.updateAuthority, isSigner: false, isWritable: false },
    { pubkey: new PublicKey('11111111111111111111111111111112'), isSigner: false, isWritable: false },
    { pubkey: new PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false },
  ];

  const nameLen = Math.min(data.name.length, 32);
  const symbolLen = Math.min(data.symbol.length, 10);
  const uriLen = Math.min(data.uri.length, 200);
  
  const instructionData = Buffer.concat([
    Buffer.from([33]), // CreateMetadataAccountV3
    Buffer.from([nameLen, 0, 0, 0]),
    Buffer.from(data.name.slice(0, nameLen), 'utf8'),
    Buffer.from([symbolLen, 0, 0, 0]),
    Buffer.from(data.symbol.slice(0, symbolLen), 'utf8'),
    Buffer.from([uriLen, 0, 0, 0]),
    Buffer.from(data.uri.slice(0, uriLen), 'utf8'),
    Buffer.from([0, 0]), // seller_fee_basis_points
    Buffer.from([0]), // creators
    Buffer.from([0]), // collection
    Buffer.from([0]), // uses
    Buffer.from([0]), // is_mutable
    Buffer.from([0]), // collection_details
  ]);

  return new TransactionInstruction({
    keys,
    programId: TOKEN_METADATA_PROGRAM_ID,
    data: instructionData,
  });
};

export const createMetadataAccount = async (connection, wallet, tokenData) => {
  try {
    const mintPublicKey = new PublicKey(tokenData.mintAddress);
    
    const [metadataAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintPublicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    
    const transaction = new Transaction();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;
    
    transaction.add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 300000 })
    );
    transaction.add(
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1000 })
    );
    
    transaction.add(
      createMetadataInstruction(
        {
          metadata: metadataAccount,
          mint: mintPublicKey,
          mintAuthority: wallet.publicKey,
          payer: wallet.publicKey,
          updateAuthority: wallet.publicKey,
        },
        {
          name: tokenData.name,
          symbol: tokenData.symbol,
          uri: tokenData.uri,
        }
      )
    );
    
    const signature = await wallet.sendTransaction(transaction, connection, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });
    
    return { signature };
    
  } catch (error) {
    throw new Error(`Metadata creation failed: ${error.message}`);
  }
};