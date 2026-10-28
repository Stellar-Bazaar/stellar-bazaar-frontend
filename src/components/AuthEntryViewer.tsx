import React from 'react';
import { ExplorerLink } from './ExplorerLink';

export interface AuthEntryViewerProps {
  invokerAddress: string;
  authorizedContractId: string;
  functionName: string;
  argumentsPreview?: Record<string, string | number>;
  className?: string;
}

export const AuthEntryViewer: React.FC<AuthEntryViewerProps> = ({
  invokerAddress,
  authorizedContractId,
  functionName,
  argumentsPreview,
  className = '',
}) => {
  return (
    <div
      className={`p-3.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl space-y-2.5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <span className="text-sm" aria-hidden="true">
            🔐
          </span>
          Soroban Authorization Scope
        </span>
        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300">
          Signature Verified
        </span>
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 dark:text-gray-400">Signer / Invoker:</span>
          <span className="font-mono text-gray-900 dark:text-gray-100">
            {invokerAddress.slice(0, 6)}...{invokerAddress.slice(-6)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500 dark:text-gray-400">Target Contract:</span>
          <ExplorerLink
            type="contract"
            value={authorizedContractId}
            network="testnet"
            truncate={true}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500 dark:text-gray-400">Invoked Function:</span>
          <code className="px-1.5 py-0.5 bg-gray-200/60 dark:bg-gray-700 font-mono text-[11px] font-semibold text-blue-600 dark:text-blue-300 rounded">
            {functionName}()
          </code>
        </div>
      </div>

      {argumentsPreview && Object.keys(argumentsPreview).length > 0 && (
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700 text-[11px]">
          <span className="font-semibold text-gray-500 dark:text-gray-400 block mb-1">
            Parameters:
          </span>
          <div className="bg-white dark:bg-gray-900 p-2 rounded-lg font-mono text-gray-800 dark:text-gray-200 space-y-0.5">
            {Object.entries(argumentsPreview).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-gray-400">{k}:</span>
                <span className="truncate max-w-[200px]">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
