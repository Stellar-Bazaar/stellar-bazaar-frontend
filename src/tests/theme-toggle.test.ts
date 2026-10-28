import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import {
  ThemeToggle,
  getInitialTheme,
  applyTheme,
  ThemeMode,
} from '../components/ThemeToggle';

describe('ThemeToggle & utilities', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is exported and defined as a React component', () => {
    expect(ThemeToggle).toBeDefined();
    expect(typeof ThemeToggle).toBe('function');
  });

  it('retrieves default theme as dark when storage is empty', () => {
    (localStorage.getItem as any).mockReturnValue(null);
    expect(getInitialTheme()).toBe('dark');
  });

  it('retrieves saved theme from storage when present', () => {
    (localStorage.getItem as any).mockReturnValue('light');
    expect(getInitialTheme()).toBe('light');

    (localStorage.getItem as any).mockReturnValue('system');
    expect(getInitialTheme()).toBe('system');
  });

  it('applies dark theme class to document element', () => {
    const classList = {
      add: vi.fn(),
      remove: vi.fn(),
    };

    vi.stubGlobal('document', {
      documentElement: { classList },
    });
    vi.stubGlobal('window', {
      matchMedia: () => ({ matches: false }),
    });

    applyTheme('dark');
    expect(classList.add).toHaveBeenCalledWith('dark');

    applyTheme('light');
    expect(classList.remove).toHaveBeenCalledWith('dark');
  });

  it('instantiates component with custom className', () => {
    const element = React.createElement(ThemeToggle, {
      className: 'custom-theme-class',
      onThemeChange: () => {},
    });

    expect(element.props.className).toBe('custom-theme-class');
  });
});
