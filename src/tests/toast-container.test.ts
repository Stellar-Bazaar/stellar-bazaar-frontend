import { describe, it, expect } from 'vitest';
import { ToastContainer } from '../components/ToastContainer';

describe('ToastContainer component', () => {
  it('is exported and defined as a React component', () => {
    expect(ToastContainer).toBeDefined();
    expect(typeof ToastContainer).toBe('function');
  });

  it('has proper component name', () => {
    expect(ToastContainer.name).toBe('ToastContainer');
  });
});
