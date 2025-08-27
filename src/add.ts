import { dexAxios, updateTxHash } from './dex';
import type { AddRequest, AddResponse } from './interface';
import { signTx } from './provider';
import { termLinkCardano } from './utils';

export async function add(args: AddRequest) {
  const response = await dexAxios.post<AddResponse>('liquidity/add', args);
  const { cbor, transactionId: txId } = response.data.data;
  console.log(`Admin signed, cbor received`);

  const txHash = await signTx(cbor);
  console.log('User signed');

  await updateTxHash(txHash, txId);
  console.log(`txId ${txId} updated with hash ${termLinkCardano(txHash)}`);
}
