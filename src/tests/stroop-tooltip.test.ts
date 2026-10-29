import { describe, it, expect } from 'vitest';
import React from 'react';
import { StroopTooltip } from '../components/StroopTooltip';

describe('StroopTooltip component', () => {
  it('is exported and defined as a React component', () => {
    expect(StroopTooltip).toBeDefined();
    expect(typeof StroopTooltip).toBe('function');
  });

  it('instantiates with default XLM primary format', () => {
    // 100,000,000 stroops = 10 XLM
    const element = React.createElement(StroopTooltip, {
      stroops: 100_000_000n,
    });

    expect(element).toBeDefined();
    expect(element.props.stroops).toBe(100_000_000n);
    expect(element.props.showStroopsPrimary).toBeUndefined();
  });

  it('instantiates with showStroopsPrimary enabled', () => {
    const element = React.createElement(StroopTooltip, {
      stroops: 25_000_000n,
      showStroopsPrimary: true,
    });

    expect(element.props.showStroopsPrimary).toBe(true);
  });
});

