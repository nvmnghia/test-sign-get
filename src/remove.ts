import { dexAxios, updateTxHash } from './dex';
import type { RemoveRequest, RemoveResponse } from './interface';
import { signTx } from './provider';
import { termLinkCardano } from './utils';

export async function remove(args: RemoveRequest) {
  const response = await dexAxios.post<RemoveResponse>(
    'liquidity/remove',
    args,
  );
  const {
    commonData: { cbor },
    txId,
  } = response.data.data;
  console.log('Admin signed, cbor received');

  const txHash = await signTx(cbor);
  console.log('User signed');

  await updateTxHash(txHash, txId);
  console.log(`txId ${txId} updated with hash ${termLinkCardano(txHash)}`);
}
