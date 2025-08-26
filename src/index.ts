import { wallet } from './provider';

(async () => {
  const CBOR = process.env.CBOR;
  if (!CBOR) throw new Error('CBOR is not set');

  const signedTx = await wallet.signTx(CBOR, true);
  const txHash = await wallet.submitTx(signedTx);
  console.log(txHash);
})().catch((error) => {
  console.error(error);
});
