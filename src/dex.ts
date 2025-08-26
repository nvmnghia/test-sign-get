import { createHash, createHmac } from 'node:crypto';

import axios, { type InternalAxiosRequestConfig } from 'axios';

import { wallet } from './provider';

let DEX_API_URL = process.env.DEX_API_URL;
if (!DEX_API_URL) throw new Error('DEX_API_URL is not set');
if (!DEX_API_URL.endsWith('/')) DEX_API_URL += '/';

const DEX_API_KEY = process.env.DEX_API_KEY;
if (!DEX_API_KEY) throw new Error('DEX_API_KEY is not set');

// biome-ignore lint/style/noNonNullAssertion: early throw
const DEX_API_SECRET = process.env.DEX_API_SECRET!;
if (!DEX_API_SECRET) throw new Error('DEX_API_SECRET is not set');

/* -------------------------------------------------------------------------- */
/*                                 Base Axios                                 */
/* -------------------------------------------------------------------------- */

export const dexAxios = axios.create({
  baseURL: DEX_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': DEX_API_KEY,
    'X-Address': await wallet.getChangeAddress(),
  },
});
dexAxios.interceptors.request.use(sign);
dexAxios.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error.response?.data),
);

function sign(config: InternalAxiosRequestConfig) {
  const method = config.method?.toUpperCase();

  const url = new URL(config.url ?? '', config.baseURL).toString();

  const payloadHash = createHash('sha512')
    .update(JSON.stringify(config.data ?? ''))
    .digest('hex');

  const timestamp = Date.now().toString();

  const message = [method, url, payloadHash, timestamp].join('\n');
  const signature = createHmac('sha256', DEX_API_SECRET)
    .update(message)
    .digest('hex');

  config.headers['X-API-Signature'] = signature;
  config.headers['X-API-Timestamp'] = timestamp;

  return config;
}

/* -------------------------------------------------------------------------- */
/*                                    APIs                                    */
/* -------------------------------------------------------------------------- */

export async function updateTxHash(txHash: string, txId: number) {
  return await dexAxios.put('transaction/update-tx-hash', {
    txHash,
    txId,
  });
}

export type TAddRequest = {
  tokenA: string;
  tokenB: string;
  amountA: number;
  amountB: number;
  useGETForFee?: boolean;
  slippage?: number;
};

export type TAddResponse = {
  data: {
    cbor: string;
    transactionId: number;
  };
};

export async function add(request: TAddRequest) {
  // FIXME: remove this
  const tokenAId = request.tokenA === 'GET' ? 1 : 2;
  const tokenBId = request.tokenB === 'GET' ? 1 : 2;

  return await dexAxios.post<TAddResponse>('liquidity/add', {
    useGETForFee: true,
    slippage: 0.5,
    tokenAId,
    tokenBId,
    ...request,
  });
}

export type TRemoveRequest = {
  poolId: number;
  amount: number;
  useGETForFee?: boolean;
  slippage?: number;
};

export type TRemoveResponse = {
  data: {
    txId: number;
    commonData: { cbor: string };
  };
};

export async function remove(request: TRemoveRequest) {
  return await dexAxios.post<TRemoveResponse>('liquidity/remove', {
    useGETForFee: true,
    slippage: 0.5,
    ...request,
  });
}

export type TSwapRequest = {
  poolId?: number;
  tokenA: string;
  amountIn: number;
  tokenB: string;
  useGETForFee?: boolean;
  slippage?: number;
};

export type TSwapResponse = {
  data: {
    transactionId: number;
    additionalInfo: {
      rawTransaction: string;
    };
  };
};

export async function swap(request: TSwapRequest) {
  const { tokenA, tokenB } = request;
  const isAdaGetSwap =
    (tokenA === 'ADA' && tokenB === 'GET') ||
    (tokenA === 'GET' && tokenB === 'ADA');
  if (isAdaGetSwap && !request.poolId)
    throw new Error('Pool ID is required for ADA-GET swap');

  return await dexAxios.post<TSwapResponse>('swap', {
    useGETForFee: true,
    slippage: 0.5,
    ...request,
  });
}
