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
  console.log(config.url, config.baseURL);

  const payloadHash = createHash('sha512')
    .update(JSON.stringify(config.data ?? ''))
    .digest('hex');

  const timestamp = Date.now().toString();

  const message = [method, url, payloadHash, timestamp].join('\n');
  console.log(message);
  const signature = createHmac('sha256', DEX_API_SECRET)
    .update(message)
    .digest('hex');

  config.headers['X-API-Signature'] = signature;
  config.headers['X-API-Timestamp'] = timestamp;

  return config;
}
