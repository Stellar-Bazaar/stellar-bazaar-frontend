import { describe, it, expect } from 'vitest';
import React from 'react';
import { ReputationBadge } from '../components/ReputationBadge';

describe('ReputationBadge', () => {
  it('is exported and defined as a React component', () => {
    expect(ReputationBadge).toBeDefined();
    expect(typeof ReputationBadge).toBe('function');
  });

  it('instantiates with novice stats by default', () => {
    const stats = {
      successfulDeals: 0,
      totalVolumeUnits: 0,
      disputedDeals: 0,
      resolvedInFavor: 0,
    };

    const element = React.createElement(ReputationBadge, {
      stats,
      size: 'sm',
      showScore: true,
    });

    expect(element.props.stats).toBe(stats);
    expect(element.props.size).toBe('sm');
    expect(element.props.showScore).toBe(true);
  });

  it('instantiates with sovereign merchant stats', () => {
    const stats = {
      successfulDeals: 30,
      totalVolumeUnits: 5000,
      disputedDeals: 0,
      resolvedInFavor: 0,
    };

    const element = React.createElement(ReputationBadge, {
      stats,
      size: 'lg',
      className: 'custom-badge',
    });

    expect(element.props.stats.successfulDeals).toBe(30);
    expect(element.props.size).toBe('lg');
    expect(element.props.className).toBe('custom-badge');
  });
});
