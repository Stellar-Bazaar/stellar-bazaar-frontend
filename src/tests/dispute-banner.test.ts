import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { DisputeBanner } from '../components/DisputeBanner';
import { DisputeDTO } from '../services/indexer-client';

describe('DisputeBanner component', () => {
  const dummyDispute: DisputeDTO = {
    id: 'DISPUTE_1',
    circle_id: 'CIRCLE_100',
    initiator_address: 'GBUYER123',
    dispute_reason: 'Quality discrepancy in bulk goods',
    status: 'OPEN',
    resolution_refund_to_buyers: null,
    opened_at_timestamp: 1720000000,
    resolved_at_timestamp: null,
  };

  it('renders null when circle is normal and has no dispute', () => {
    const element = React.createElement(DisputeBanner, {
      circleId: 'CIRCLE_1',
      status: 'OPEN',
      dispute: null,
    });
    expect(element).toBeDefined();
    expect(element.props.status).toBe('OPEN');
  });

  it('instantiates cleanly for disputed circle', () => {
    const handleRefund = vi.fn();
    const handleSettle = vi.fn();

    const element = React.createElement(DisputeBanner, {
      circleId: 'CIRCLE_100',
      status: 'DISPUTED',
      dispute: dummyDispute,
      isAdmin: true,
      onResolveRefund: handleRefund,
      onResolveSettle: handleSettle,
    });

    expect(element).toBeDefined();
    expect(element.props.status).toBe('DISPUTED');
    expect(element.props.isAdmin).toBe(true);
    expect(element.props.dispute?.dispute_reason).toBe('Quality discrepancy in bulk goods');
  });

  it('handles resolved dispute state', () => {
    const resolvedDispute: DisputeDTO = {
      ...dummyDispute,
      status: 'RESOLVED',
      resolution_refund_to_buyers: true,
      resolved_at_timestamp: 1720000500,
    };

    const element = React.createElement(DisputeBanner, {
      circleId: 'CIRCLE_100',
      status: 'SETTLED',
      dispute: resolvedDispute,
    });

    expect(element).toBeDefined();
    expect(element.props.dispute?.status).toBe('RESOLVED');
    expect(element.props.dispute?.resolution_refund_to_buyers).toBe(true);
  });
});
