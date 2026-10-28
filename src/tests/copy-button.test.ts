import { describe, it, expect } from 'vitest';
import { CopyButton } from '../components/CopyButton';

describe('CopyButton component', () => {
  it('is exported and defined as a React component', () => {
    expect(CopyButton).toBeDefined();
    expect(typeof CopyButton).toBe('function');
  });
});
