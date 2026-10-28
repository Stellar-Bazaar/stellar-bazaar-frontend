import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  label?: string;
  size?: number;
  className?: string;
  showText?: boolean;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label = 'Copy to clipboard',
  size = 14,
  className = '',
  showText = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy to clipboard:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied to clipboard' : label}
      title={copied ? 'Copied!' : label}
      className={`btn-copy ${className}`}
      style={{
        background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
        border: `1px solid ${copied ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.12)'}`,
        borderRadius: '6px',
        color: copied ? '#34d399' : 'var(--text-muted)',
        cursor: 'pointer',
        padding: '0.3rem 0.5rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontSize: '0.75rem',
        transition: 'all 0.15s ease',
      }}
    >
      {copied ? <Check size={size} color="#34d399" /> : <Copy size={size} />}
      {showText && <span>{copied ? 'Copied!' : 'Copy'}</span>}
      <span className="sr-only" aria-live="polite">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </button>
  );
};
