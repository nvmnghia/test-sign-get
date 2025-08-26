import { BlockfrostProvider, MeshWallet } from '@meshsdk/core';
import dotenv from 'dotenv';

dotenv.config();

const BLOCKFROST_PROJECT_ID = process.env.BLOCKFROST_PROJECT_ID;
export const BLOCKFROST_NETWORK = process.env.BLOCKFROST_NETWORK || 'preprod';
const WALLET_MNEMONIC = process.env.WALLET_MNEMONIC;
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;

if (!BLOCKFROST_PROJECT_ID || (!WALLET_MNEMONIC && !WALLET_PRIVATE_KEY)) {
  throw new Error(
    'Missing required environment variables. Need BLOCKFROST_PROJECT_ID and either WALLET_MNEMONIC or WALLET_PRIVATE_KEY',
  );
}

const blockfrostProvider = new BlockfrostProvider(BLOCKFROST_PROJECT_ID);

// Initialize wallet (supports both mnemonic and private key)
const walletConfig = WALLET_MNEMONIC
  ? { type: 'mnemonic' as const, words: WALLET_MNEMONIC.split(' ') }
  : { type: 'cli' as const, payment: WALLET_PRIVATE_KEY! };

export const wallet = new MeshWallet({
  networkId: BLOCKFROST_NETWORK === 'mainnet' ? 1 : 0,
  fetcher: blockfrostProvider,
  submitter: blockfrostProvider,
  key: walletConfig,
});

/**
 * Given a CBOR, sign it and submit it to the network.
 * Return the txHash.
 */
export async function signTx(cbor: string) {
  const signedTx = await wallet.signTx(cbor, true);
  return await wallet.submitTx(signedTx);
}
