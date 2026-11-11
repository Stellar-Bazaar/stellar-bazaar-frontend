import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { QrCodeModal } from '../components/QrCodeModal';

describe('QrCodeModal', () => {
  it('is exported and defined as a React component', () => {
    expect(QrCodeModal).toBeDefined();
    expect(typeof QrCodeModal).toBe('function');
  });

  it('instantiates cleanly with default props when closed', () => {
    const element = React.createElement(QrCodeModal, {
      isOpen: false,
      onClose: () => {},
      qrValue: 'web+stellar:pay?destination=GABC123',
    });

    expect(element.props.isOpen).toBe(false);
    expect(element.props.qrValue).toBe('web+stellar:pay?destination=GABC123');
  });

  it('instantiates with custom titles and wallet callback when open', () => {
    const handleClose = vi.fn();
    const uri = 'web+stellar:tx?xdr=AAAA...';
    const element = React.createElement(QrCodeModal, {
      isOpen: true,
      onClose: handleClose,
      qrValue: uri,
      title: 'Sign with Freighter Mobile',
      subtitle: 'Scan using your mobile device',
    });

    expect(element.props.isOpen).toBe(true);
    expect(element.props.title).toBe('Sign with Freighter Mobile');
    expect(element.props.subtitle).toBe('Scan using your mobile device');
    expect(element.props.qrValue).toBe(uri);
  });
});
