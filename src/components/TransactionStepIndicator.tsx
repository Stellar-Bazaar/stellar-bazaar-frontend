import React from 'react';
import { ExplorerLink } from './ExplorerLink';

export type TransactionStep =
  | 'idle'
  | 'simulating'
  | 'signing'
  | 'submitting'
  | 'confirmed'
  | 'failed';

export interface TransactionStepIndicatorProps {
  currentStep: TransactionStep;
  error?: string;
  txHash?: string;
  ledgerSeq?: number;
  className?: string;
}

const STEPS = [
  { key: 'simulating', label: '1. Simulate Soroban', icon: '⚡' },
  { key: 'signing', label: '2. Wallet Signature', icon: '✍️' },
  { key: 'submitting', label: '3. Ledger Ingestion', icon: '🚀' },
  { key: 'confirmed', label: '4. Confirmed on Chain', icon: '✅' },
] as const;

export const TransactionStepIndicator: React.FC<TransactionStepIndicatorProps> = ({
  currentStep,
  error,
  txHash,
  ledgerSeq,
  className = '',
}) => {
  if (currentStep === 'idle') return null;

  const getStepIndex = (step: TransactionStep) => {
    switch (step) {
      case 'simulating':
        return 0;
      case 'signing':
        return 1;
      case 'submitting':
        return 2;
      case 'confirmed':
        return 3;
      case 'failed':
        return 2;
      default:
        return -1;
    }
  };

  const activeIndex = getStepIndex(currentStep);

  return (
    <div
      className={`p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xs space-y-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Stellar Transaction Pipeline
        </span>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            currentStep === 'confirmed'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
              : currentStep === 'failed'
              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 animate-pulse'
          }`}
        >
          {currentStep.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 pt-1">
        {STEPS.map((step, idx) => {
          const isDone = activeIndex > idx || currentStep === 'confirmed';
          const isCurrent = activeIndex === idx && currentStep !== 'confirmed' && currentStep !== 'failed';
          const isFailed = currentStep === 'failed' && activeIndex === idx;

          return (
            <div
              key={step.key}
              className={`p-2 text-center rounded-xl border text-[11px] font-medium transition-colors ${
                isDone
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : isCurrent
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20'
                  : isFailed
                  ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
                  : 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-700 text-gray-400'
              }`}
            >
              <span className="text-sm block mb-0.5" aria-hidden="true">
                {isFailed ? '❌' : isDone ? '✓' : step.icon}
              </span>
              <span className="block truncate">{step.label}</span>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300">
          <strong>Transaction Error:</strong> {error}
        </div>
      )}

      {txHash && (
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs">
          <span className="text-gray-500">Explorer Link:</span>
          <ExplorerLink type="tx" value={txHash} network="testnet" />
        </div>
      )}

      {ledgerSeq && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Inclusion Ledger:</span>
          <span className="font-mono font-bold text-gray-900 dark:text-gray-100">
            #{ledgerSeq}
          </span>
        </div>
      )}
    </div>
  );
};

