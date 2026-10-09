export type PaymentStatus =
  | 'IDLE'
  | 'VALIDATING'
  | 'BUILDING_TRANSACTION'
  | 'AWAITING_WALLET_SIGNATURE'
  | 'SUBMITTING_TO_TESTNET'
  | 'CONFIRMED'
  | 'FAILED';

export interface PaymentFormValues {
  destinationAddress: string;
  amount: string;
  memo: string;
}

export interface PaymentValidationErrors {
  destinationAddress?: string;
  amount?: string;
  memo?: string;
}

export interface TransactionConfirmation {
  hash: string;
  ledger: number;
  submittedAt: Date;
  destination: string;
  amount: string;
  explorerUrl: string;
}
