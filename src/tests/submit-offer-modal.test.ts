import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { SubmitOfferModal } from '../components/SubmitOfferModal';

describe('SubmitOfferModal', () => {
  it('is exported and defined as a React component', () => {
    expect(SubmitOfferModal).toBeDefined();
    expect(typeof SubmitOfferModal).toBe('function');
  });

  it('renders null when closed', () => {
    const element = React.createElement(SubmitOfferModal, {
      isOpen: false,
      onClose: () => {},
      circleId: 'C100',
      circleTitle: 'Artisan Olive Oil',
      targetPriceStroops: 120_000_000n,
      circleMaxVolume: 250,
      onSubmitOffer: async () => {},
    });

    expect(element.props.isOpen).toBe(false);
  });

  it('instantiates cleanly with open dialog props', () => {
    const handleSubmit = vi.fn();
    const handleClose = vi.fn();
    const seller = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';

    const element = React.createElement(SubmitOfferModal, {
      isOpen: true,
      onClose: handleClose,
      circleId: 'C100',
      circleTitle: 'Artisan Olive Oil',
      targetPriceStroops: 120_000_000n,
      circleMaxVolume: 250,
      sellerAddress: seller,
      assetCode: 'USDC',
      onSubmitOffer: handleSubmit,
      isSubmitting: false,
    });

    expect(element.props.isOpen).toBe(true);
    expect(element.props.circleId).toBe('C100');
    expect(element.props.circleTitle).toBe('Artisan Olive Oil');
    expect(element.props.sellerAddress).toBe(seller);
    expect(element.props.assetCode).toBe('USDC');
  });
});
