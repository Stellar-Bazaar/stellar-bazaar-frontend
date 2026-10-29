import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import {
  FilterBar,
  CATEGORIES,
  STATUS_OPTIONS,
  SORT_OPTIONS,
} from '../components/FilterBar';

describe('FilterBar', () => {
  it('is exported and defined as a React component', () => {
    expect(FilterBar).toBeDefined();
    expect(typeof FilterBar).toBe('function');
  });

  it('exports valid categories, statuses, and sort options', () => {
    expect(CATEGORIES.length).toBeGreaterThan(3);
    expect(CATEGORIES).toContain('All');
    expect(STATUS_OPTIONS.some((s) => s.id === 'OPEN')).toBe(true);
    expect(SORT_OPTIONS.some((s) => s.id === 'volume_desc')).toBe(true);
  });

  it('instantiates with active filters and callbacks', () => {
    const handleCategory = vi.fn();
    const handleStatus = vi.fn();
    const handleSort = vi.fn();

    const element = React.createElement(FilterBar, {
      activeCategory: 'Food & Agriculture',
      onSelectCategory: handleCategory,
      activeStatus: 'OPEN',
      onSelectStatus: handleStatus,
      activeSort: 'volume_desc',
      onSelectSort: handleSort,
      totalCount: 14,
    });

    expect(element.props.activeCategory).toBe('Food & Agriculture');
    expect(element.props.activeStatus).toBe('OPEN');
    expect(element.props.activeSort).toBe('volume_desc');
    expect(element.props.totalCount).toBe(14);
  });
});

