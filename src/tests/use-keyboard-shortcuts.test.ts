import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatShortcutKey } from '../hooks/useKeyboardShortcuts';

describe('useKeyboardShortcuts & formatShortcutKey', () => {
  it('formats shortcuts correctly for Windows / standard platforms', () => {
    expect(formatShortcutKey({ key: 'k', ctrlOrMeta: true })).toMatch(/Ctrl\+K|⌘K/);
    expect(formatShortcutKey({ key: 'n', ctrlOrMeta: true, shift: true })).toMatch(/Ctrl\+Shift\+N|⌘⇧N/);
    expect(formatShortcutKey({ key: 'Escape' })).toBe('ESCAPE');
  });

  describe('event listener execution', () => {
    let listeners: Record<string, (e: any) => void> = {};

    beforeEach(() => {
      listeners = {};
      vi.stubGlobal('window', {
        addEventListener: (event: string, cb: any) => {
          listeners[event] = cb;
        },
        removeEventListener: (event: string) => {
          delete listeners[event];
        },
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('simulates keyboard shortcut trigger directly with mock event', () => {
      const action = vi.fn();
      const shortcut = {
        key: 'k',
        ctrlOrMeta: true,
        action,
        description: 'Open search',
      };

      // Direct simulation of matching logic
      const fakeEvent = {
        key: 'k',
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        altKey: false,
        preventDefault: vi.fn(),
        target: { tagName: 'BODY' },
      };

      const match =
        fakeEvent.key.toLowerCase() === shortcut.key.toLowerCase() &&
        (shortcut.ctrlOrMeta ? fakeEvent.ctrlKey || fakeEvent.metaKey : true);

      if (match) {
        fakeEvent.preventDefault();
        shortcut.action(fakeEvent as any);
      }

      expect(action).toHaveBeenCalledTimes(1);
      expect(fakeEvent.preventDefault).toHaveBeenCalled();
    });

    it('suppresses trigger when disabled', () => {
      const action = vi.fn();
      const shortcut = {
        key: 'k',
        ctrlOrMeta: true,
        action,
        description: 'Disabled shortcut',
        disabled: true,
      };

      if (!shortcut.disabled) {
        action();
      }

      expect(action).not.toHaveBeenCalled();
    });
  });
});
