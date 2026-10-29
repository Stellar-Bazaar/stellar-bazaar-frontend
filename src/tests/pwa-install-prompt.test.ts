import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { PwaInstallPrompt } from '../components/PwaInstallPrompt';

describe('PwaInstallPrompt', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
    });
    vi.stubGlobal('window', {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is exported and defined as a React component', () => {
    expect(PwaInstallPrompt).toBeDefined();
    expect(typeof PwaInstallPrompt).toBe('function');
  });

  it('instantiates cleanly with onInstalled callback', () => {
    const handleInstalled = vi.fn();
    const element = React.createElement(PwaInstallPrompt, {
      onInstalled: handleInstalled,
      className: 'my-install-prompt',
    });

    expect(element.props.onInstalled).toBe(handleInstalled);
    expect(element.props.className).toBe('my-install-prompt');
  });
});

