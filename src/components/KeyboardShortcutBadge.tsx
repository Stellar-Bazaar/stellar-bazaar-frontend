import React from 'react';
import { formatShortcutKey } from '../hooks/useKeyboardShortcuts';

export interface KeyboardShortcutBadgeProps {
  shortcut: {
    ctrlOrMeta?: boolean;
    shift?: boolean;
    alt?: boolean;
    key: string;
  };
  className?: string;
}

export const KeyboardShortcutBadge: React.FC<KeyboardShortcutBadgeProps> = ({
  shortcut,
  className = '',
}) => {
  const isMac =
    typeof navigator !== 'undefined' &&
    /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent);

  const keys: string[] = [];
  if (shortcut.ctrlOrMeta) keys.push(isMac ? '⌘' : 'Ctrl');
  if (shortcut.shift) keys.push(isMac ? '⇧' : 'Shift');
  if (shortcut.alt) keys.push(isMac ? '⌥' : 'Alt');
  keys.push(shortcut.key.toUpperCase());

  const fullLabel = formatShortcutKey(shortcut);

  return (
    <span
      className={`inline-flex items-center space-x-1 ${className}`}
      aria-label={`Shortcut: ${fullLabel}`}
      data-testid="shortcut-badge"
    >
      {keys.map((k, idx) => (
        <React.Fragment key={idx}>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-300 bg-slate-800 border border-slate-700/80 rounded shadow-xs select-none">
            {k}
          </kbd>
          {idx < keys.length - 1 && !isMac && (
            <span className="text-slate-500 text-[10px] select-none">+</span>
          )}
        </React.Fragment>
      ))}
    </span>
  );
};

