import { ethers } from 'ethers';

import { BridgeAbi, EvmErc20Abi } from './bridge';
import { dexAxios, updateTxHash } from './dex';
import type {
  SwapRequest,
  SwapResponse,
  SwapUsdtToGetResponse,
} from './interface';
import { BRIDGE_ADDRESS, ethWallet, signTx, USDT_ADDRESS } from './provider';
import { termLinkCardano, termLinkEth } from './utils';

export async function swap(args: SwapRequest) {
  const { tokenA, tokenB } = args;

  const isAdaGetSwap =
    (tokenA === 'ADA' && tokenB === 'GET') ||
    (tokenA === 'GET' && tokenB === 'ADA');
  if (isAdaGetSwap && !args.poolId)
    throw new Error('Pool ID is required for ADA-GET swap');

  const isUsdtToGetSwap = tokenA === 'USDT' && tokenB === 'GET';
  if (isUsdtToGetSwap) await swapUsdtToGet(args);
  else await _swap(args);
}

/**
 * Normal swap flow. Used for all swaps except USDT->GET.
 */
async function _swap(args: SwapRequest) {
  const response = await dexAxios.post<SwapResponse>('swap', args);
  const {
    additionalInfo: { rawTransaction: cbor },
    transactionId: txId,
  } = response.data.data;
  console.log('Admin signed, cbor received');

  const txHash = await signTx(cbor);
  console.log('User signed');

  await updateTxHash(txHash, txId);
  console.log(`txId ${txId} updated with hash ${termLinkCardano(txHash)}`);
}

async function swapUsdtToGet(args: SwapRequest) {
  const { data: payload } = await dexAxios.post<SwapUsdtToGetResponse>(
    'swap',
    args,
  );
  console.log('Admin signed');

  const { usdtAmount } = payload.data;
  await approve(usdtAmount);
  console.log(`${usdtAmount / 10 ** 6} USDT approved`);

  const txHash = await initSwapUsdtToGet(payload);

  const { txId } = payload.data;
  await updateTxHash(txHash, payload.data.txId);
  console.log(`txId ${txId} updated with hash ${termLinkEth(txHash)}`);
}

async function approve(usdtAmount: number) {
  const usdtContract = new ethers.Contract(
    USDT_ADDRESS,
    EvmErc20Abi,
    ethWallet,
  );

  const approveTx = await usdtContract.approve(BRIDGE_ADDRESS, usdtAmount);
  await approveTx.wait();
}

async function initSwapUsdtToGet({ data }: SwapUsdtToGetResponse) {
  const bridgeContract = new ethers.Contract(
    BRIDGE_ADDRESS,
    BridgeAbi,
    ethWallet,
  );

  const tx = await bridgeContract.swapUSDTtoGET(
    data.cardanoAddress,
    data.usdtAmount,
    data.getAmount,
    data.feeETH,
    data.deadline,
    data.signature,
    {
      // We only send fee
      value: data.feeETH,
    },
  );
  return tx.hash as string;
}
