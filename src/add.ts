import * as dex from './dex';
import { BLOCKFROST_NETWORK, signTx } from './provider';
import { terminalLink } from './utils';

const response = await dex.add({
  tokenA: 'ADA',
  amountA: 1,
  tokenB: 'GET',
  amountB: 100,
});
const { cbor, transactionId: txId } = response.data.data;
console.log('Admin signed, cbor received');

const txHash = await signTx(cbor);
console.log('User signed');

await dex.updateTxHash(txHash, txId);
const link = `https://${BLOCKFROST_NETWORK}.cardanoscan.io/transaction/${txHash}`;
console.log(`txId ${txId} updated with hash ${terminalLink(link, txHash)}`);
