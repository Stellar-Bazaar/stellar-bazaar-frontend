import React from 'react';
import { useToast, ToastMessage } from '../context/ToastContext';
import { ExplorerLink } from './ExplorerLink';

const ICONS: Record<ToastMessage['type'], string> = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

const STYLES: Record<ToastMessage['type'], string> = {
  success:
    'bg-white dark:bg-gray-800 border-emerald-300 dark:border-emerald-700 text-gray-900 dark:text-gray-100 shadow-lg',
  error:
    'bg-white dark:bg-gray-800 border-red-300 dark:border-red-700 text-gray-900 dark:text-gray-100 shadow-lg',
  warning:
    'bg-white dark:bg-gray-800 border-amber-300 dark:border-amber-700 text-gray-900 dark:text-gray-100 shadow-lg',
  info:
    'bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-700 text-gray-900 dark:text-gray-100 shadow-lg',
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <aside
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      aria-label="Notification Toasts"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-3.5 border rounded-xl flex items-start gap-3 transition-all duration-300 transform translate-y-0 ${
            STYLES[toast.type]
          }`}
          role={toast.type === 'error' ? 'alert' : 'status'}
        >
          <span className="text-base shrink-0 select-none" aria-hidden="true">
            {ICONS[toast.type]}
          </span>
          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-bold leading-tight truncate">{toast.title}</h5>
            {toast.message && (
              <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5 leading-snug break-words">
                {toast.message}
              </p>
            )}
            {toast.txHash && (
              <div className="mt-1.5 pt-1 border-t border-gray-100 dark:border-gray-700">
                <ExplorerLink type="tx" value={toast.txHash} network="testnet" label="View Transaction" />
              </div>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs p-1 rounded-sm shrink-0"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </aside>
  );
};
