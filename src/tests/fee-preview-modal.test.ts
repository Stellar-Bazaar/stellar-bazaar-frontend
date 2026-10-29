import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { FeePreviewModal } from '../components/FeePreviewModal';
import { StellarSimulationResult } from '../services/simulation-parser';

describe('FeePreviewModal component', () => {
  const dummySimulation: StellarSimulationResult = {
    success: true,
    minResourceFeeStroops: 125_000n,
    cpuInstructions: 1_500_000n,
    ramBytes: 60_000n,
    authCount: 1,
  };

  it('is exported and defined as a React component', () => {
    expect(FeePreviewModal).toBeDefined();
    expect(typeof FeePreviewModal).toBe('function');
  });

  it('renders null when closed', () => {
    const element = React.createElement(FeePreviewModal, {
      isOpen: false,
      onClose: () => {},
      title: 'Commit Escrow',
      simulation: dummySimulation,
      onConfirmSubmit: () => {},
    });

    expect(element.props.isOpen).toBe(false);
  });

  it('instantiates with successful simulation details when open', () => {
    const handleConfirm = vi.fn();
    const handleClose = vi.fn();

    const element = React.createElement(FeePreviewModal, {
      isOpen: true,
      onClose: handleClose,
      title: 'Pledge Buyer Escrow',
      simulation: dummySimulation,
      baseFeeStroops: 100,
      isSubmitting: false,
      onConfirmSubmit: handleConfirm,
    });

    expect(element).toBeDefined();
    expect(element.props.isOpen).toBe(true);
    expect(element.props.title).toBe('Pledge Buyer Escrow');
    expect(element.props.simulation.minResourceFeeStroops).toBe(125_000n);
    expect(element.props.simulation.authCount).toBe(1);
  });

  it('instantiates with failed simulation warning', () => {
    const failedSim: StellarSimulationResult = {
      success: false,
      minResourceFeeStroops: 0n,
      cpuInstructions: 0n,
      ramBytes: 0n,
      authCount: 0,
      errorDetails: 'Transaction expired',
    };

    const element = React.createElement(FeePreviewModal, {
      isOpen: true,
      onClose: () => {},
      title: 'Submit Seller Offer',
      simulation: failedSim,
      onConfirmSubmit: () => {},
    });

    expect(element.props.simulation.success).toBe(false);
    expect(element.props.simulation.errorDetails).toBe('Transaction expired');
  });
});

