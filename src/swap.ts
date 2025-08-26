import * as dex from './dex';
import { signTx } from './provider';
import { termLinkBf } from './utils';

const response = await dex.swap({
  tokenA: 'ADA',
  amountIn: 1,
  tokenB: 'GET',
  poolId: 1,
});
const {
  additionalInfo: { rawTransaction: cbor },
  transactionId: txId,
} = response.data.data;
console.log('Admin signed, rawTransaction received');

const txHash = await signTx(cbor);
console.log('User signed');

await dex.updateTxHash(txHash, txId);
console.log(`txId ${txId} updated with hash ${termLinkBf(txHash)}`);
