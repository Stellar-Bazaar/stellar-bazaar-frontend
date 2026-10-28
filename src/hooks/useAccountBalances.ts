import { useState, useEffect, useCallback } from 'react';
import { AccountBalanceMap } from '../components/AccountBalanceCard';
import { parseAssetAmount } from '../utils/parse-asset';

export interface HorizonBalanceLine {
  asset_type: string;
  balance: string;
  asset_code?: string;
  asset_issuer?: string;
}

/**
 * Pure parser mapping Horizon RPC account balances into AccountBalanceMap BigInts
 */
export function parseHorizonBalances(lines: HorizonBalanceLine[]): AccountBalanceMap {
  const result: AccountBalanceMap = {
    XLM: 0n,
    USDC: 0n,
    EURC: 0n,
  };

  for (const line of lines) {
    try {
      if (line.asset_type === 'native') {
        result.XLM = parseAssetAmount(line.balance);
      } else if (line.asset_code?.toUpperCase() === 'USDC') {
        result.USDC = parseAssetAmount(line.balance);
      } else if (line.asset_code?.toUpperCase() === 'EURC') {
        result.EURC = parseAssetAmount(line.balance);
      }
    } catch {
      // Ignore unparseable lines
    }
  }

  return result;
}

export function useAccountBalances(
  publicKey: string | null,
  horizonUrl: string = 'https://horizon-testnet.stellar.org'
) {
  const [balances, setBalances] = useState<AccountBalanceMap>({
    XLM: 0n,
    USDC: 0n,
    EURC: 0n,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFunding, setIsFunding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!publicKey) {
      setBalances({ XLM: 0n, USDC: 0n, EURC: 0n });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const resp = await fetch(`${horizonUrl}/accounts/${publicKey}`);
      if (resp.status === 404) {
        // Unfunded account on testnet
        setBalances({ XLM: 0n, USDC: 0n, EURC: 0n });
        return;
      }

      if (!resp.ok) {
        throw new Error(`Horizon error: ${resp.statusText}`);
      }

      const data = await resp.json();
      if (Array.isArray(data.balances)) {
        setBalances(parseHorizonBalances(data.balances));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balances');
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, horizonUrl]);

  const fundFriendbot = useCallback(async () => {
    if (!publicKey) return;

    setIsFunding(true);
    setError(null);

    try {
      const resp = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
      if (!resp.ok) {
        throw new Error(`Friendbot funding error: ${resp.statusText}`);
      }
      // Re-fetch balances after funding
      await fetchBalances();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Friendbot funding failed');
    } finally {
      setIsFunding(false);
    }
  }, [publicKey, fetchBalances]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    balances,
    isLoading,
    isFunding,
    error,
    refetch: fetchBalances,
    fundFriendbot,
  };
}
