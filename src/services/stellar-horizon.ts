import {
  Horizon,
  Networks,
  TransactionBuilder,
  Operation,
  Asset,
  Memo,
} from '@stellar/stellar-sdk';
import { AssetBalance, AccountBalanceState } from '../types/wallet';

export const HORIZON_TESTNET_URL =
  import.meta.env.VITE_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';
export const TESTNET_PASSPHRASE =
  import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET;
export const EXPLORER_BASE_URL =
  import.meta.env.VITE_STELLAR_EXPLORER_URL || 'https://stellar.expert/explorer/testnet';

const server = new Horizon.Server(HORIZON_TESTNET_URL);

/**
 * Loads real account balances from Stellar Testnet Horizon.
 * Gracefully handles 404 (unfunded accounts) and network timeouts.
 */
export async function fetchAccountBalances(publicKey: string): Promise<AccountBalanceState> {
  try {
    const accountRecord = await server.loadAccount(publicKey);
    const balances: AssetBalance[] = accountRecord.balances.map((b) => {
      const isNative = b.asset_type === 'native';
      const code = isNative ? 'XLM' : (b as any).asset_code || 'UNKNOWN';
      const issuer = isNative ? undefined : (b as any).asset_issuer;
      return {
        assetCode: code,
        assetIssuer: issuer,
        balance: b.balance,
        isNative,
      };
    });

    const nativeBalance = balances.find((b) => b.isNative);
    const xlm = nativeBalance ? nativeBalance.balance : '0.0000000';

    return {
      xlm,
      balances,
      isFunded: true,
      lastFetchedAt: new Date(),
      isLoading: false,
      error: null,
    };
  } catch (err: any) {
    // 404 means the account keypair is valid but has not yet received its initial funding deposit
    if (err?.response?.status === 404) {
      return {
        xlm: '0.0000000',
        balances: [],
        isFunded: false,
        lastFetchedAt: new Date(),
        isLoading: false,
        error: 'Account not funded yet on Stellar Testnet.',
      };
    }

    const message =
      err?.message ||
      'Failed to connect to Stellar Testnet Horizon. Please check your internet connection.';
    return {
      xlm: '0.0000000',
      balances: [],
      isFunded: false,
      lastFetchedAt: null,
      isLoading: false,
      error: message,
    };
  }
}

/**
 * Builds an unsigned Stellar Payment Transaction XDR on Testnet.
 */
export async function buildPaymentTransactionXdr(params: {
  sourceAddress: string;
  destinationAddress: string;
  amount: string;
  memo?: string;
}): Promise<string> {
  const { sourceAddress, destinationAddress, amount, memo } = params;

  // 1. Fetch source account from Horizon to obtain the current sequence number
  const sourceAccount = await server.loadAccount(sourceAddress);

  // 2. Build the transaction
  const builder = new TransactionBuilder(sourceAccount, {
    fee: '100', // Standard Stellar base fee (100 stroops = 0.00001 XLM)
    networkPassphrase: TESTNET_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination: destinationAddress,
        asset: Asset.native(),
        amount: Number(amount).toFixed(7),
      })
    )
    .setTimeout(60); // 60 seconds transaction time bound

  if (memo && memo.trim()) {
    builder.addMemo(Memo.text(memo.trim().slice(0, 28)));
  }

  const tx = builder.build();
  return tx.toXDR();
}

/**
 * Submits a signed transaction XDR to the Stellar Testnet network.
 */
export async function submitSignedTransaction(
  signedXdr: string
): Promise<{ hash: string; ledger: number }> {
  try {
    const tx = TransactionBuilder.fromXDR(signedXdr, TESTNET_PASSPHRASE);
    const submissionResult = await server.submitTransaction(tx as any);

    if (!submissionResult.successful && submissionResult.successful !== undefined) {
      throw new Error('Transaction was not included in the ledger.');
    }

    return {
      hash: submissionResult.hash,
      ledger: submissionResult.ledger,
    };
  } catch (err: any) {
    throw new Error(parseHorizonError(err));
  }
}

/**
 * Translates low-level Stellar Horizon error responses into clear human-readable messages.
 */
export function parseHorizonError(error: unknown): string {
  if (!error) return 'An unexpected error occurred.';

  if (typeof error === 'string') {
    if (error.toLowerCase().includes('reject') || error.toLowerCase().includes('denied')) {
      return 'Transaction signature was rejected by user.';
    }
    return error;
  }

  const errObj = error as Record<string, any>;
  const rawMsg = errObj.message || '';

  if (
    rawMsg.toLowerCase().includes('reject') ||
    rawMsg.toLowerCase().includes('denied') ||
    rawMsg.toLowerCase().includes('declined')
  ) {
    return 'Transaction signature was rejected by the wallet.';
  }

  // Horizon error codes
  const responseData = errObj.response?.data;
  if (responseData?.extras?.result_codes) {
    const codes = responseData.extras.result_codes;
    const opCodes: string[] = codes.operations || [];

    if (opCodes.includes('op_underfunded')) {
      return 'Payment failed: Source account does not have sufficient XLM to cover this payment and required base reserves.';
    }
    if (opCodes.includes('op_no_destination')) {
      return 'Payment failed: The destination account has not been activated yet on Stellar Testnet. Minimum 1 XLM is required to create an account.';
    }
    if (opCodes.includes('op_low_reserve')) {
      return 'Payment failed: Transaction would reduce balance below the required minimum base reserve.';
    }
    if (codes.transaction === 'tx_insufficient_balance') {
      return 'Payment failed: Insufficient balance to cover transaction fees.';
    }
    if (codes.transaction === 'tx_bad_seq') {
      return 'Payment failed: Account sequence out of sync. Please wait a moment and try again.';
    }
  }

  if (errObj.response?.status === 404) {
    return 'Account not found on Stellar Testnet. Please fund your account using the Testnet Friendbot.';
  }

  return rawMsg || 'Transaction submission failed. Please check network and try again.';
}

/**
 * Triggers official Stellar Friendbot to fund a Testnet public key with 10,000 XLM.
 */
export async function fundWithFriendbot(publicKey: string): Promise<boolean> {
  try {
    const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
    return res.ok;
  } catch (err) {
    console.warn('Friendbot error:', err);
    return false;
  }
}
