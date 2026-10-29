import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { OfferCard } from '../components/OfferCard';
import { MerchantOffer } from '../types/merchant-offer';

describe('OfferCard', () => {
  const mockOffer: MerchantOffer = {
    id: 'OFFER_101',
    circleId: 'CIRCLE_42',
    sellerAddress: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
    pricePerUnitStroops: 8_500_000n,
    minVolume: 50,
    maxVolume: 500,
    leadTimeLedgers: 720, // 1 hour
    status: 'PENDING',
    createdAt: 1700000000,
  };

  it('is exported and defined as a React component', () => {
    expect(OfferCard).toBeDefined();
    expect(typeof OfferCard).toBe('function');
  });

  it('instantiates cleanly with default buyer view', () => {
    const element = React.createElement(OfferCard, {
      offer: mockOffer,
      targetPriceStroops: 10_000_000n,
      assetCode: 'USDC',
    });

    expect(element.props.offer.id).toBe('OFFER_101');
    expect(element.props.targetPriceStroops).toBe(10_000_000n);
    expect(element.props.assetCode).toBe('USDC');
    expect(element.props.isCircleCreator).toBeFalsy();
  });

  it('instantiates with creator accept offer callback', () => {
    const handleAccept = vi.fn();
    const element = React.createElement(OfferCard, {
      offer: mockOffer,
      targetPriceStroops: 10_000_000n,
      isCircleCreator: true,
      onAcceptOffer: handleAccept,
      isAccepting: true,
    });

    expect(element.props.isCircleCreator).toBe(true);
    expect(element.props.onAcceptOffer).toBe(handleAccept);
    expect(element.props.isAccepting).toBe(true);
  });
});

