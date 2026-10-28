import { useEffect, useCallback } from 'react';

export interface ShortcutConfig {
  key: string;
  ctrlOrMeta?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: (e: KeyboardEvent) => void;
  description: string;
  disabled?: boolean;
  allowInInput?: boolean;
}

export function formatShortcutKey(shortcut: {
  ctrlOrMeta?: boolean;
  shift?: boolean;
  alt?: boolean;
  key: string;
}): string {
  const isMac =
    typeof navigator !== 'undefined' &&
    /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent);

  const parts: string[] = [];
  if (shortcut.ctrlOrMeta) parts.push(isMac ? '⌘' : 'Ctrl');
  if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift');
  if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');
  parts.push(shortcut.key.toUpperCase());

  return parts.join(isMac ? '' : '+');
}

export function useKeyboardShortcuts(
  shortcuts: ShortcutConfig[],
  enabled = true
): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const target = event.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      for (const shortcut of shortcuts) {
        if (shortcut.disabled) continue;

        // Don't intercept typing in inputs unless explicitly allowed (e.g. Escape)
        if (isInput && !shortcut.allowInInput && event.key !== 'Escape') {
          continue;
        }

        const matchKey =
          event.key.toLowerCase() === shortcut.key.toLowerCase();
        const matchCtrlMeta = shortcut.ctrlOrMeta
          ? event.ctrlKey || event.metaKey
          : !event.ctrlKey && !event.metaKey;
        const matchShift = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const matchAlt = shortcut.alt ? event.altKey : !event.altKey;

        if (matchKey && matchCtrlMeta && matchShift && matchAlt) {
          event.preventDefault();
          shortcut.action(event);
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
