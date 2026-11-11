import { describe, it, expect } from 'vitest';
import React from 'react';
import { KeyboardShortcutBadge } from '../components/KeyboardShortcutBadge';

describe('KeyboardShortcutBadge', () => {
  it('is exported and defined as a React component', () => {
    expect(KeyboardShortcutBadge).toBeDefined();
    expect(typeof KeyboardShortcutBadge).toBe('function');
  });

  it('instantiates with single key shortcut', () => {
    const element = React.createElement(KeyboardShortcutBadge, {
      shortcut: { key: 'Escape' },
    });

    expect(element.props.shortcut.key).toBe('Escape');
  });

  it('instantiates with composite modifier shortcut', () => {
    const element = React.createElement(KeyboardShortcutBadge, {
      shortcut: { key: 'k', ctrlOrMeta: true },
      className: 'ml-2',
    });

    expect(element.props.shortcut.key).toBe('k');
    expect(element.props.shortcut.ctrlOrMeta).toBe(true);
    expect(element.props.className).toBe('ml-2');
  });
});
