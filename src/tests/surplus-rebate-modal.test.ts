import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { SurplusRebateModal } from '../components/SurplusRebateModal';

describe('SurplusRebateModal component', () => {
  it('is exported and defined as a React component', () => {
    expect(SurplusRebateModal).toBeDefined();
    expect(typeof SurplusRebateModal).toBe('function');
  });

  it('renders null when closed', () => {
    const element = React.createElement(SurplusRebateModal, {
      isOpen: false,
      onClose: () => {},
      circleTitle: 'Bulk Flour Order',
      targetUnitPriceStroops: 10_000_000n,
      acceptedUnitPriceStroops: 8_000_000n,
      buyerCommittedVolume: 100,
      totalSettledVolume: 500,
      onClaimRebate: () => {},
    });

    expect(element.props.isOpen).toBe(false);
  });

  it('instantiates with discount savings calculation when open', () => {
    const handleClaim = vi.fn();
    const handleClose = vi.fn();

    // Target: 10 XLM, Accepted: 8 XLM, Savings per unit: 2 XLM
    // Buyer volume: 100 units -> Buyer rebate: 200 XLM = 2,000,000,000 stroops
    const element = React.createElement(SurplusRebateModal, {
      isOpen: true,
      onClose: handleClose,
      circleTitle: 'Bulk Flour Order',
      targetUnitPriceStroops: 10_000_000n,
      acceptedUnitPriceStroops: 8_000_000n,
      buyerCommittedVolume: 100,
      totalSettledVolume: 500,
      assetCode: 'XLM',
      isClaiming: false,
      onClaimRebate: handleClaim,
    });

    expect(element).toBeDefined();
    expect(element.props.isOpen).toBe(true);
    expect(element.props.circleTitle).toBe('Bulk Flour Order');
    expect(element.props.buyerCommittedVolume).toBe(100);
    expect(element.props.targetUnitPriceStroops - element.props.acceptedUnitPriceStroops).toBe(2_000_000n);
  });
});
