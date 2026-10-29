import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isRpcReachable: boolean;
  lastChecked: number;
  checkConnectivity: () => Promise<boolean>;
}

export function useNetworkStatus(
  heartbeatUrl: string = 'https://horizon-testnet.stellar.org',
  checkIntervalMs: number = 30000
): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isRpcReachable, setIsRpcReachable] = useState<boolean>(true);
  const [lastChecked, setLastChecked] = useState<number>(Date.now);

  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return true;

    if (!navigator.onLine) {
      setIsOnline(false);
      setIsRpcReachable(false);
      setLastChecked(Date.now());
      return false;
    }

    try {
      // Fast lightweight HEAD / GET check to Horizon
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(heartbeatUrl, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);

      const reachable = res.ok || res.status === 200 || res.status === 404;
      setIsOnline(true);
      setIsRpcReachable(reachable);
      setLastChecked(Date.now());
      return reachable;
    } catch {
      // If fetch fails, RPC is unreachable even if browser thinks it is online
      setIsRpcReachable(false);
      setLastChecked(Date.now());
      return false;
    }
  }, [heartbeatUrl]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      checkConnectivity();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsRpcReachable(false);
      setLastChecked(Date.now());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkConnectivity();

    // Periodic heartbeat check
    const intervalId = setInterval(checkConnectivity, checkIntervalMs);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [checkConnectivity, checkIntervalMs]);

  return {
    isOnline,
    isRpcReachable,
    lastChecked,
    checkConnectivity,
  };
}

