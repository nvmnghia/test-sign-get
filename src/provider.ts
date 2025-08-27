import { BlockfrostProvider, MeshWallet } from '@meshsdk/core';
import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

const WALLET_MNEMONIC = process.env.WALLET_MNEMONIC;
if (!WALLET_MNEMONIC) throw new Error('WALLET_MNEMONIC is not set');

/* -------------------------------------------------------------------------- */
/*                                   Cardano                                  */
/* -------------------------------------------------------------------------- */

const BLOCKFROST_PROJECT_ID = process.env.BLOCKFROST_PROJECT_ID;
export const BLOCKFROST_NETWORK = process.env.BLOCKFROST_NETWORK || 'preprod';

if (!BLOCKFROST_PROJECT_ID) {
  throw new Error(
    'Missing required environment variables. Need BLOCKFROST_PROJECT_ID',
  );
}

const blockfrostProvider = new BlockfrostProvider(BLOCKFROST_PROJECT_ID);

export const wallet = new MeshWallet({
  networkId: BLOCKFROST_NETWORK === 'mainnet' ? 1 : 0,
  fetcher: blockfrostProvider,
  submitter: blockfrostProvider,
  key: { type: 'mnemonic' as const, words: WALLET_MNEMONIC.split(' ') },
});
export const cardanoAddress = await wallet.getChangeAddress();
console.log('Cardano address: ', cardanoAddress);

/**
 * Given a CBOR, sign it and submit it to the network.
 * Return the txHash.
 */
export async function signTx(cbor: string) {
  const signedTx = await wallet.signTx(cbor, true);
  return await wallet.submitTx(signedTx);
}

/* -------------------------------------------------------------------------- */
/*                                  Ethereum                                  */
/* -------------------------------------------------------------------------- */

export const BRIDGE_ADDRESS = process.env.BRIDGE_ADDRESS as string;
if (!BRIDGE_ADDRESS) throw new Error('BRIDGE_ADDRESS is not set');

export const USDT_ADDRESS = process.env.USDT_ADDRESS as string;
if (!USDT_ADDRESS) throw new Error('USDT_ADDRESS is not set');

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
if (!ALCHEMY_API_KEY) throw new Error('ALCHEMY_API_KEY is not set');

const rpcUrl = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
export const ethProvider = new ethers.JsonRpcProvider(rpcUrl);

export const ethWallet = ethers.Wallet.fromPhrase(WALLET_MNEMONIC, ethProvider);
console.log('Ethereum address: ', ethWallet.address);
