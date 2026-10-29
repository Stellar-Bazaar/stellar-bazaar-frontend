/**
 * Soroban Transaction Simulation Parser
 * Decodes Soroban RPC simulateTransaction JSON responses into structured resource metrics,
 * execution instructions, and authorization requirements.
 */

export interface SorobanSimulationResponse {
  id?: string;
  latestLedger: number;
  minResourceFee?: string;
  cost?: {
    cpuInsns: string;
    memBytes: string;
  };
  results?: Array<{
    auth?: string[];
    xdr?: string;
  }>;
  transactionData?: string;
  error?: string;
}

export interface StellarSimulationResult {
  success: boolean;
  minResourceFeeStroops: bigint;
  cpuInstructions: bigint;
  ramBytes: bigint;
  authCount: number;
  errorDetails?: string;
  transactionDataXdr?: string;
}

/**
 * Parses raw Soroban RPC simulateTransaction JSON into a typed StellarSimulationResult
 */
export function parseSimulationResponse(
  response: Partial<SorobanSimulationResponse>
): StellarSimulationResult {
  if (!response) {
    return {
      success: false,
      minResourceFeeStroops: 0n,
      cpuInstructions: 0n,
      ramBytes: 0n,
      authCount: 0,
      errorDetails: 'Empty simulation response from Soroban RPC',
    };
  }

  if (response.error) {
    return {
      success: false,
      minResourceFeeStroops: 0n,
      cpuInstructions: 0n,
      ramBytes: 0n,
      authCount: 0,
      errorDetails: response.error,
    };
  }

  let minResourceFeeStroops = 0n;
  try {
    if (response.minResourceFee) {
      minResourceFeeStroops = BigInt(response.minResourceFee);
    }
  } catch {
    minResourceFeeStroops = 0n;
  }

  let cpuInstructions = 0n;
  let ramBytes = 0n;
  if (response.cost) {
    try {
      cpuInstructions = BigInt(response.cost.cpuInsns || '0');
      ramBytes = BigInt(response.cost.memBytes || '0');
    } catch {
      // Ignore conversion failure
    }
  }

  let authCount = 0;
  if (Array.isArray(response.results)) {
    for (const res of response.results) {
      if (Array.isArray(res.auth)) {
        authCount += res.auth.length;
      }
    }
  }

  return {
    success: true,
    minResourceFeeStroops,
    cpuInstructions,
    ramBytes,
    authCount,
    transactionDataXdr: response.transactionData,
  };
}

/**
 * Computes combined total transaction fee (network base fee + Soroban resource fee)
 */
export function calculateTotalFee(baseFeeStroops: number, resourceFeeStroops: bigint): bigint {
  return BigInt(Math.max(100, baseFeeStroops)) + resourceFeeStroops;
}

