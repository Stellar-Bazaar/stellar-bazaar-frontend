import { describe, it, expect } from 'vitest';
import React from 'react';
import { ToastProvider, useToast } from '../context/ToastContext';

describe('ToastContext and ToastProvider', () => {
  it('exports ToastProvider and useToast functions', () => {
    expect(ToastProvider).toBeDefined();
    expect(typeof ToastProvider).toBe('function');
    expect(useToast).toBeDefined();
    expect(typeof useToast).toBe('function');
  });

  it('throws error when useToast is used outside of React component', () => {
    // Calling useToast outside of component tree should throw
    expect(() => useToast()).toThrow();
  });

  it('instantiates ToastProvider with child components', () => {
    const child = React.createElement('div', null, 'Content');
    const provider = React.createElement(ToastProvider, null, child);

    expect(provider).toBeDefined();
    expect(provider.props.children).toBe(child);
  });
});
