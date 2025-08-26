import { BLOCKFROST_NETWORK } from './provider';

/**
 * Create a OSC-8 escape sequence for a terminal link
 */
export function termLink(url: string, text: string) {
  return `\u001b]8;;${url}\u001b\\${text}\u001b]8;;\u001b\\`;
}

export function termLinkBf(txHash: string) {
  const link = `https://${BLOCKFROST_NETWORK}.cardanoscan.io/transaction/${txHash}`;
  return termLink(link, txHash);
}
