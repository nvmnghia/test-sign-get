export type AddRequest = {
  tokenA: string;
  tokenB: string;
  amountA: number;
  amountB: number;
  useGETForFee?: boolean;
  slippage?: number;
};

export type AddResponse = {
  data: {
    cbor: string;
    transactionId: number;
  };
};

export type RemoveRequest = {
  poolId: number;
  amount: number;
  useGETForFee?: boolean;
  slippage?: number;
};

export type RemoveResponse = {
  data: {
    txId: number;
    commonData: { cbor: string };
  };
};

export type SwapRequest = {
  poolId?: number;
  tokenA: string;
  amountIn: number;
  tokenB: string;
  useGETForFee?: boolean;
  slippage?: number;
};

export type SwapResponse = {
  data: {
    transactionId: number;
    additionalInfo: {
      rawTransaction: string;
    };
  };
};

export type SwapUsdtToGetResponse = {
  data: {
    txId: number;
    cardanoAddress: string;
    usdtAmount: number; // * 10^decimal already
    getAmount: number; // This one too
    feeETH: string; // In wei
    deadline: string; // Epoch timestamp in second
    signature: string;
    messageHash: string;
  };
};
