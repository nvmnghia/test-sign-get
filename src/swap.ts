import { dexAxios, updateTxHash } from './dex';
import type { SwapRequest, SwapResponse } from './interface';
import { signTx } from './provider';
import { termLinkBf } from './utils';

export async function swap(args: SwapRequest) {
  const { tokenA, tokenB } = args;
  const isAdaGetSwap =
    (tokenA === 'ADA' && tokenB === 'GET') ||
    (tokenA === 'GET' && tokenB === 'ADA');
  if (isAdaGetSwap && !args.poolId)
    throw new Error('Pool ID is required for ADA-GET swap');

  const response = await dexAxios.post<SwapResponse>('swap', args);
  const {
    additionalInfo: { rawTransaction: cbor },
    transactionId: txId,
  } = response.data.data;
  console.log('Admin signed, rawTransaction received');

  const txHash = await signTx(cbor);
  console.log('User signed');

  await updateTxHash(txHash, txId);
  console.log(`txId ${txId} updated with hash ${termLinkBf(txHash)}`);
}
