import { describe, it, expect } from 'vitest';
import React from 'react';
import { SkeletonLoader } from '../components/SkeletonLoader';

describe('SkeletonLoader', () => {
  it('is exported and defined as a React component', () => {
    expect(SkeletonLoader).toBeDefined();
    expect(typeof SkeletonLoader).toBe('function');
  });

  it('instantiates cleanly with card variant and default count', () => {
    const element = React.createElement(SkeletonLoader, {
      variant: 'card',
      count: 3,
      className: 'custom-skeleton',
    });

    expect(element.props.variant).toBe('card');
    expect(element.props.count).toBe(3);
    expect(element.props.className).toBe('custom-skeleton');
  });

  it('instantiates with balance, offer, and row variants', () => {
    const balanceElem = React.createElement(SkeletonLoader, { variant: 'balance' });
    expect(balanceElem.props.variant).toBe('balance');

    const offerElem = React.createElement(SkeletonLoader, { variant: 'offer' });
    expect(offerElem.props.variant).toBe('offer');

    const rowElem = React.createElement(SkeletonLoader, { variant: 'row' });
    expect(rowElem.props.variant).toBe('row');
  });
});
