/**
 * Soroban contract error decoder for Stellar Bazaar.
 * Maps contract error codes (1-27) from the Bazaar Deal Engine and Registry
 * into actionable user-facing error explanations and remediation advice.
 */

export interface DecodedContractError {
  code: number;
  name: string;
  title: string;
  explanation: string;
  remediation: string;
}

export const CONTRACT_ERROR_MAP: Record<number, DecodedContractError> = {
  1: {
    code: 1,
    name: 'AlreadyInitialized',
    title: 'Contract Already Initialized',
    explanation: 'The contract has already been configured with an administrator address.',
    remediation: 'No action needed. Operations should proceed against the active contract state.',
  },
  2: {
    code: 2,
    name: 'NotInitialized',
    title: 'Contract Not Initialized',
    explanation: 'The contract requires administrative initialization before this operation.',
    remediation: 'Contact the protocol administrator to initialize the contract deployment.',
  },
  3: {
    code: 3,
    name: 'Unauthorized',
    title: 'Unauthorized Action',
    explanation: 'The calling account does not have permission to execute this operation.',
    remediation: 'Ensure your connected Stellar wallet matches the authorized owner or administrator.',
  },
  4: {
    code: 4,
    name: 'CircleNotFound',
    title: 'Demand Circle Not Found',
    explanation: 'No demand circle exists matching the requested ID.',
    remediation: 'Verify the Circle ID or refresh the circle registry list.',
  },
  5: {
    code: 5,
    name: 'CircleAlreadyClosed',
    title: 'Demand Circle Closed',
    explanation: 'This demand circle has already reached final closure or settlement.',
    remediation: 'Browse active demand circles to place commitments or submit merchant offers.',
  },
  6: {
    code: 6,
    name: 'CircleNotSettled',
    title: 'Circle Not Settled',
    explanation: 'Deal settlement operations require the demand circle to be successfully closed first.',
    remediation: 'Wait for buyer commitments to meet quorum and the inspection window to pass.',
  },
  7: {
    code: 7,
    name: 'InvalidAmount',
    title: 'Invalid Escrow Amount',
    explanation: 'The specified token payment or collateral amount is zero or negative.',
    remediation: 'Enter a positive numeric amount exceeding 0 stroops.',
  },
  8: {
    code: 8,
    name: 'InvalidVolume',
    title: 'Invalid Order Volume',
    explanation: 'The requested quantity is zero or exceeds allowable circle parameters.',
    remediation: 'Enter a valid positive unit quantity within the minimum and maximum order constraints.',
  },
  9: {
    code: 9,
    name: 'DeadlinePassed',
    title: 'Circle Deadline Expired',
    explanation: 'The deadline for participating in this demand circle has already elapsed.',
    remediation: 'This circle is now closed to new commitments or offers. Request a refund or check newer circles.',
  },
  10: {
    code: 10,
    name: 'DeadlineNotPassed',
    title: 'Deadline Still Active',
    explanation: 'Premature expiration cannot be triggered while the participation window remains active.',
    remediation: 'Wait until the target ledger timestamp has elapsed before closing or triggering expiry refunds.',
  },
  11: {
    code: 11,
    name: 'QuorumNotReached',
    title: 'Target Quorum Not Reached',
    explanation: 'The total committed volume is below the required threshold for deal execution.',
    remediation: 'Share the circle with other buyers to attract additional volume before the deadline.',
  },
  12: {
    code: 12,
    name: 'OfferNotFound',
    title: 'Merchant Offer Not Found',
    explanation: 'The specified seller offer ID does not exist for this circle.',
    remediation: 'Check the list of active seller offers and select a valid offer ID.',
  },
  13: {
    code: 13,
    name: 'OfferMismatch',
    title: 'Offer Parameter Mismatch',
    explanation: 'The submitted deal parameters do not match the recorded merchant offer.',
    remediation: 'Refresh offer details to ensure the pricing, volume, and lead time match the on-chain record.',
  },
  14: {
    code: 14,
    name: 'AlreadyCommitted',
    title: 'Duplicate Commitment',
    explanation: 'Your account has already deposited an active commitment for this demand circle.',
    remediation: 'Each participant may hold one active escrow commitment per circle.',
  },
  15: {
    code: 15,
    name: 'CommitmentNotFound',
    title: 'No Escrow Commitment Found',
    explanation: 'No active buyer commitment was found for the specified account in this circle.',
    remediation: 'Verify your connected wallet address corresponds to the buyer who deposited escrow.',
  },
  16: {
    code: 16,
    name: 'AlreadyRefunded',
    title: 'Escrow Already Refunded',
    explanation: 'The escrow deposit for this commitment has already been refunded to your wallet.',
    remediation: 'Check your Stellar account transaction history on Stellar.Expert.',
  },
  17: {
    code: 17,
    name: 'VolumeExceeded',
    title: 'Maximum Circle Volume Exceeded',
    explanation: 'Your commitment quantity exceeds the maximum allowable units for this circle.',
    remediation: 'Reduce the quantity of units requested to fit within the remaining circle capacity.',
  },
  18: {
    code: 18,
    name: 'RegistryError',
    title: 'Registry Cross-Contract Failure',
    explanation: 'The deal engine encountered an error communicating with the demand circle registry contract.',
    remediation: 'Confirm both contracts are deployed on the same Stellar network (Testnet).',
  },
  19: {
    code: 19,
    name: 'PriceExceedsTarget',
    title: 'Offer Exceeds Target Price',
    explanation: 'The merchant offer price per unit exceeds the maximum ceiling defined by buyers.',
    remediation: 'Lower your offer price per unit to meet or beat the maximum circle target price.',
  },
  20: {
    code: 20,
    name: 'DuplicateOffer',
    title: 'Duplicate Merchant Offer',
    explanation: 'This merchant account has already submitted an offer for this demand circle.',
    remediation: 'Withdraw or update your existing offer rather than submitting a duplicate.',
  },
  21: {
    code: 21,
    name: 'NotUnderInspection',
    title: 'Deal Not Under Inspection',
    explanation: 'Final settlement or buyer dispute filings require the deal to be in the inspection phase.',
    remediation: 'Ensure the seller has fulfilled the order and marked the deal as delivered.',
  },
  22: {
    code: 22,
    name: 'DisputeAlreadyOpen',
    title: 'Dispute Already Open',
    explanation: 'A buyer dispute is already active and awaiting protocol administrator mediation.',
    remediation: 'Monitor the dispute banner for updates from the administrative review.',
  },
  23: {
    code: 23,
    name: 'DisputeNotOpen',
    title: 'No Active Dispute',
    explanation: 'Resolution operations can only be executed on deals with an active dispute flag.',
    remediation: 'Only deals currently marked DISPUTED can be settled via dispute resolution.',
  },
  24: {
    code: 24,
    name: 'DisputeUnauthorized',
    title: 'Dispute Action Unauthorized',
    explanation: 'Only the circle creator or designated arbitrator can perform this dispute action.',
    remediation: 'Connect the administrator or buyer address that initiated the order.',
  },
  25: {
    code: 25,
    name: 'InvalidFeeBps',
    title: 'Invalid Protocol Fee',
    explanation: 'The protocol fee rate exceeds the allowable protocol maximum (500 bps = 5%).',
    remediation: 'Set a protocol fee basis point value between 0 and 500 bps.',
  },
  26: {
    code: 26,
    name: 'NoSurplusRebate',
    title: 'No Surplus Rebate Available',
    explanation: 'The final deal cleared at the ceiling price; there is no price delta rebate to claim.',
    remediation: 'Surplus rebates are only available when the merchant cleared below buyer target price.',
  },
  27: {
    code: 27,
    name: 'AlreadyClaimedRebate',
    title: 'Rebate Already Claimed',
    explanation: 'Your account has already claimed its proportional surplus rebate for this circle.',
    remediation: 'Your escrow savings rebate has already been credited to your Stellar wallet.',
  },
};

export const UNKNOWN_SOROBAN_ERROR: DecodedContractError = {
  code: 0,
  name: 'UnknownContractError',
  title: 'Soroban Execution Failure',
  explanation: 'The Soroban smart contract returned an unspecified error or trap during execution.',
  remediation: 'Check your wallet balance, asset trustlines, and network connectivity before re-submitting.',
};

/**
 * Decodes any raw error string or Error instance to find Soroban contract error codes.
 */
export function decodeSorobanError(rawError: unknown): DecodedContractError {
  if (typeof rawError === 'number') {
    return CONTRACT_ERROR_MAP[rawError] || {
      ...UNKNOWN_SOROBAN_ERROR,
      code: rawError,
      explanation: `Soroban contract error code #${rawError} returned without mapped metadata.`,
    };
  }

  const errorString = String(
    rawError && typeof rawError === 'object' && 'message' in rawError
      ? (rawError as { message: unknown }).message
      : rawError
  );

  // Common Soroban error patterns:
  // "HostError: Error(Contract, #21)"
  // "Error(Contract, 21)"
  // "ContractError(21)"
  // "code: 21"
  const match = errorString.match(/(?:Contract,\s*#?|ContractError\(|code:\s*)(\d+)/i);
  if (match && match[1]) {
    const code = parseInt(match[1], 10);
    if (CONTRACT_ERROR_MAP[code]) {
      return CONTRACT_ERROR_MAP[code];
    }
    return {
      ...UNKNOWN_SOROBAN_ERROR,
      code,
      explanation: `Soroban contract error code #${code} occurred.`,
    };
  }

  // Check for common keyword matches
  if (/insufficient balance/i.test(errorString)) {
    return {
      code: 101,
      name: 'InsufficientBalance',
      title: 'Insufficient Stellar Balance',
      explanation: 'Your account lacks sufficient balance to cover the transaction value or network fees.',
      remediation: 'Fund your Stellar account using Friendbot on Testnet or deposit XLM.',
    };
  }

  if (/user rejected|user cancelled|declined/i.test(errorString)) {
    return {
      code: 102,
      name: 'UserRejected',
      title: 'Transaction Signature Cancelled',
      explanation: 'The transaction was cancelled or rejected in your Stellar wallet extension.',
      remediation: 'Approve the signature request in Freighter or your connected wallet to proceed.',
    };
  }

  return UNKNOWN_SOROBAN_ERROR;
}

