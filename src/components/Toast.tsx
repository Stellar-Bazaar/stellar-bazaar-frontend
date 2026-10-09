import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'SUCCESS' | 'ERROR' | 'INFO';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 90,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1.15rem',
            borderRadius: 'var(--radius-md)',
            background:
              toast.type === 'SUCCESS'
                ? 'rgba(16, 185, 129, 0.95)'
                : toast.type === 'ERROR'
                ? 'rgba(239, 68, 68, 0.95)'
                : 'rgba(99, 102, 241, 0.95)',
            color: '#ffffff',
            boxShadow: 'var(--shadow-lg)',
            fontSize: '0.875rem',
            fontWeight: 500,
            maxWidth: '380px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {toast.type === 'SUCCESS' && <CheckCircle2 size={18} />}
          {toast.type === 'ERROR' && <AlertCircle size={18} />}
          {toast.type === 'INFO' && <Info size={18} />}
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '0.2rem',
              display: 'flex',
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
