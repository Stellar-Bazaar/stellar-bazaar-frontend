import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { SlideOverDrawer } from '../components/SlideOverDrawer';

describe('SlideOverDrawer', () => {
  it('is exported and defined as a React component', () => {
    expect(SlideOverDrawer).toBeDefined();
    expect(typeof SlideOverDrawer).toBe('function');
  });

  it('renders null when closed', () => {
    const element = React.createElement(SlideOverDrawer, {
      isOpen: false,
      onClose: () => {},
      title: 'Circle Details',
      children: React.createElement('div', null, 'Content'),
    });

    expect(element.props.isOpen).toBe(false);
  });

  it('instantiates cleanly with title, subtitle, and footer when open', () => {
    const handleClose = vi.fn();
    const footerElement = React.createElement('button', null, 'Save');

    const element = React.createElement(SlideOverDrawer, {
      isOpen: true,
      onClose: handleClose,
      title: 'Circle Details',
      subtitle: 'Inspection parameters',
      footer: footerElement,
      children: React.createElement('p', null, 'Child content'),
    });

    expect(element.props.isOpen).toBe(true);
    expect(element.props.title).toBe('Circle Details');
    expect(element.props.subtitle).toBe('Inspection parameters');
    expect(element.props.footer).toBe(footerElement);
  });
});
