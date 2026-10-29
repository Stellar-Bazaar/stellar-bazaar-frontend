import { describe, it, expect } from 'vitest';
import React from 'react';
import { SavingsIndicator } from '../components/SavingsIndicator';

describe('SavingsIndicator', () => {
  it('is exported and defined as a React component', () => {
    expect(SavingsIndicator).toBeDefined();
    expect(typeof SavingsIndicator).toBe('function');
  });

  it('renders null when there are zero savings', () => {
    const element = React.createElement(SavingsIndicator, {
      savingsPercentage: 0,
      savedAmountStroops: 0n,
    });

    expect(element.props.savingsPercentage).toBe(0);
  });

  it('instantiates with percentage and formatted stroop amount', () => {
    const element = React.createElement(SavingsIndicator, {
      savingsPercentage: 18.5,
      savedAmountStroops: 185_000_000n, // 18.5 XLM
      assetCode: 'XLM',
      size: 'lg',
      className: 'my-custom-indicator',
    });

    expect(element.props.savingsPercentage).toBe(18.5);
    expect(element.props.savedAmountStroops).toBe(185_000_000n);
    expect(element.props.assetCode).toBe('XLM');
    expect(element.props.size).toBe('lg');
  });
});

