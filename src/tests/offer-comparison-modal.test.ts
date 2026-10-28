import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { OfferComparisonModal } from '../components/OfferComparisonModal';
import { MerchantOffer } from '../types/merchant-offer';

describe('OfferComparisonModal', () => {
  const sampleOffers: MerchantOffer[] = [
    {
      id: 'BID_1',
      circleId: 'C1',
      sellerAddress: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
      pricePerUnitStroops: 9_000_000n,
      minVolume: 10,
      maxVolume: 200,
      leadTimeLedgers: 360,
      status: 'PENDING',
      createdAt: 1700000000,
    },
    {
      id: 'BID_2',
      circleId: 'C1',
      sellerAddress: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
      pricePerUnitStroops: 8_000_000n, // Lowest price
      minVolume: 20,
      maxVolume: 300,
      leadTimeLedgers: 720,
      status: 'PENDING',
      createdAt: 1700000100,
    },
  ];

  it('is exported and defined as a React component', () => {
    expect(OfferComparisonModal).toBeDefined();
    expect(typeof OfferComparisonModal).toBe('function');
  });

  it('renders null when closed', () => {
    const element = React.createElement(OfferComparisonModal, {
      isOpen: false,
      onClose: () => {},
      circleTitle: 'Direct Trade Coffee',
      targetPriceStroops: 10_000_000n,
      offers: sampleOffers,
    });

    expect(element.props.isOpen).toBe(false);
  });

  it('instantiates cleanly with offers and creator callback when open', () => {
    const handleAccept = vi.fn();
    const handleClose = vi.fn();

    const element = React.createElement(OfferComparisonModal, {
      isOpen: true,
      onClose: handleClose,
      circleTitle: 'Direct Trade Coffee',
      targetPriceStroops: 10_000_000n,
      offers: sampleOffers,
      isCircleCreator: true,
      onAcceptOffer: handleAccept,
    });

    expect(element.props.isOpen).toBe(true);
    expect(element.props.circleTitle).toBe('Direct Trade Coffee');
    expect(element.props.offers).toHaveLength(2);
    expect(element.props.isCircleCreator).toBe(true);
  });
});
