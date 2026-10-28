import { useState, useCallback } from 'react';
import { StellarSimulationResult } from '../services/simulation-parser';
import { TransactionStep } from '../components/TransactionStepIndicator';

export interface UseStellarTransactionReturn {
  step: TransactionStep;
  simulation: StellarSimulationResult | null;
  isPreviewOpen: boolean;
  txHash: string | null;
  ledgerSeq: number | null;
  error: string | null;
  prepare: (
    title: string,
    simulateFn: () => Promise<StellarSimulationResult>,
    executeFn: () => Promise<{ txHash: string; ledger?: number }>
  ) => Promise<void>;
  confirmAndExecute: () => Promise<void>;
  cancel: () => void;
  reset: () => void;
  title: string;
}

export function useStellarTransaction(): UseStellarTransactionReturn {
  const [step, setStep] = useState<TransactionStep>('idle');
  const [simulation, setSimulation] = useState<StellarSimulationResult | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [ledgerSeq, setLedgerSeq] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('Contract Invocation');

  const [pendingExecuteFn, setPendingExecuteFn] = useState<
    (() => Promise<{ txHash: string; ledger?: number }>) | null
  >(null);

  const prepare = useCallback(
    async (
      txTitle: string,
      simulateFn: () => Promise<StellarSimulationResult>,
      executeFn: () => Promise<{ txHash: string; ledger?: number }>
    ) => {
      setTitle(txTitle);
      setStep('simulating');
      setError(null);
      setTxHash(null);
      setLedgerSeq(null);

      try {
        const simResult = await simulateFn();
        setSimulation(simResult);
        setPendingExecuteFn(() => executeFn);
        setIsPreviewOpen(true);
      } catch (err: unknown) {
        setStep('failed');
        setError(err instanceof Error ? err.message : 'Simulation failed');
      }
    },
    []
  );

  const confirmAndExecute = useCallback(async () => {
    if (!pendingExecuteFn) return;

    setIsPreviewOpen(false);
    setStep('signing');

    try {
      setStep('submitting');
      const result = await pendingExecuteFn();
      setTxHash(result.txHash);
      if (result.ledger) {
        setLedgerSeq(result.ledger);
      }
      setStep('confirmed');
    } catch (err: unknown) {
      setStep('failed');
      setError(err instanceof Error ? err.message : 'Transaction execution failed');
    }
  }, [pendingExecuteFn]);

  const cancel = useCallback(() => {
    setIsPreviewOpen(false);
    setStep('idle');
    setPendingExecuteFn(null);
  }, []);

  const reset = useCallback(() => {
    setStep('idle');
    setSimulation(null);
    setIsPreviewOpen(false);
    setTxHash(null);
    setLedgerSeq(null);
    setError(null);
    setPendingExecuteFn(null);
  }, []);

  return {
    step,
    simulation,
    isPreviewOpen,
    txHash,
    ledgerSeq,
    error,
    prepare,
    confirmAndExecute,
    cancel,
    reset,
    title,
  };
}
