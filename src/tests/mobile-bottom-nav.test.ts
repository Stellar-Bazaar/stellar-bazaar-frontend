import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { MobileBottomNav } from '../components/MobileBottomNav';

describe('MobileBottomNav', () => {
  it('is exported and defined as a React component', () => {
    expect(MobileBottomNav).toBeDefined();
    expect(typeof MobileBottomNav).toBe('function');
  });

  it('instantiates with active tab and callbacks', () => {
    const handleSelect = vi.fn();
    const element = React.createElement(MobileBottomNav, {
      activeTab: 'circles',
      onSelectTab: handleSelect,
      orderCount: 3,
      hasDispute: false,
    });

    expect(element.props.activeTab).toBe('circles');
    expect(element.props.orderCount).toBe(3);
    expect(element.props.onSelectTab).toBe(handleSelect);
  });

  it('instantiates with dispute warning state', () => {
    const handleSelect = vi.fn();
    const element = React.createElement(MobileBottomNav, {
      activeTab: 'orders',
      onSelectTab: handleSelect,
      orderCount: 1,
      hasDispute: true,
      className: 'custom-mobile-nav',
    });

    expect(element.props.activeTab).toBe('orders');
    expect(element.props.hasDispute).toBe(true);
    expect(element.props.className).toBe('custom-mobile-nav');
  });
});

