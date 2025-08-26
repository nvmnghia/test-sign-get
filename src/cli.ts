#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { add } from './add';
import * as dex from './dex';
import { signTx } from './provider';
import { remove } from './remove';
import { swap } from './swap';
import { termLinkBf } from './utils';

yargs(hideBin(process.argv))
  .command(
    'add <tokenA> <amountA> <tokenB> <amountB>',
    'Add liquidity to a pool',
    setupAdd,
    async (argv) => {
      try {
        const { fee, ...rest } = argv;
        await add({
          ...rest,
          useGETForFee: fee === 'GET',
        });
      } catch (error) {
        console.error('Error adding liquidity:', error);
        process.exit(1);
      }
    },
  )
  .command(
    'remove <poolId> <amount>',
    'Remove liquidity from a pool',
    setupRemove,
    async (argv) => {
      try {
        const { fee, ...rest } = argv;
        await remove({
          ...rest,
          useGETForFee: fee === 'GET',
        });
      } catch (error) {
        console.error('Error:', error);
        process.exit(1);
      }
    },
  )
  .command(
    'swap <tokenA> <amountIn> <tokenB> <poolId>',
    'Swap tokens',
    setupSwap,
    async (argv) => {
      try {
        const { fee, ...rest } = argv;
        await swap({
          ...rest,
          useGETForFee: fee === 'GET',
        });
      } catch (error) {
        console.error('Error:', error);
        process.exit(1);
      }
    },
  )
  .command(
    'sign <cbor> <txId>',
    'Sign and submit a transaction with CBOR and update transaction hash',
    (yargs) => {
      return yargs
        .positional('cbor', {
          describe: 'CBOR encoded transaction',
          type: 'string',
          demandOption: true,
        })
        .positional('txId', {
          describe: 'Transaction ID',
          type: 'number',
          demandOption: true,
        });
    },
    async ({ cbor, txId }) => {
      try {
        const txHash = await signTx(cbor);
        console.log('User signed');

        await dex.updateTxHash(txHash, txId);
        console.log(`txId ${txId} updated with hash ${termLinkBf(txHash)}`);
      } catch (error) {
        console.error('Error:', error);
        process.exit(1);
      }
    },
  )
  .demandCommand(1, 'You need at least one command')
  .help().argv;

function setupAdd(yargs: yargs.Argv) {
  return yargs
    .positional('tokenA', {
      describe: 'First token symbol',
      type: 'string',
      demandOption: true,
    })
    .positional('amountA', {
      describe: 'Amount of first token',
      type: 'number',
      demandOption: true,
    })
    .positional('tokenB', {
      describe: 'Second token symbol',
      type: 'string',
      demandOption: true,
    })
    .positional('amountB', {
      describe: 'Amount of second token',
      type: 'number',
      demandOption: true,
    })
    .option('fee', {
      describe: 'Fee token',
      type: 'string',
      default: 'GET',
    })
    .option('slippage', {
      describe: 'Slippage tolerance',
      type: 'number',
      default: 0.5,
    });
}

function setupRemove(yargs: yargs.Argv) {
  return yargs
    .positional('poolId', {
      describe: 'Pool ID',
      type: 'number',
      demandOption: true,
    })
    .positional('amount', {
      describe: 'Amount to remove',
      type: 'number',
      demandOption: true,
    })
    .option('fee', {
      describe: 'Fee token',
      type: 'string',
      default: 'GET',
    })
    .option('slippage', {
      describe: 'Slippage tolerance',
      type: 'number',
      default: 0.5,
    });
}

function setupSwap(yargs: yargs.Argv) {
  return yargs
    .positional('tokenA', {
      describe: 'Input token symbol',
      type: 'string',
      demandOption: true,
    })
    .positional('amountIn', {
      describe: 'Amount of input token',
      type: 'number',
      demandOption: true,
    })
    .positional('tokenB', {
      describe: 'Output token symbol',
      type: 'string',
      demandOption: true,
    })
    .positional('poolId', {
      describe: 'Pool ID',
      type: 'number',
      demandOption: true,
    })
    .option('fee', {
      describe: 'Fee token',
      type: 'string',
      default: 'GET',
    })
    .option('slippage', {
      describe: 'Slippage tolerance',
      type: 'number',
      default: 0.5,
    });
}
