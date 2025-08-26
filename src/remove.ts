import * as dex from './dex';
import { signTx } from './provider';
import { termLinkBf } from './utils';

const response = await dex.remove({ poolId: 1, amount: 10_000 });
const {
  commonData: { cbor },
  txId,
} = response.data.data;
console.log('Admin signed, cbor received');

const txHash = await signTx(cbor);
console.log('User signed');

await dex.updateTxHash(txHash, txId);
console.log(`txId ${txId} updated with hash ${termLinkBf(txHash)}`);
