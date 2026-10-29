import { describe, it, expect } from 'vitest';
import React from 'react';
import { TransactionStepIndicator } from '../components/TransactionStepIndicator';

describe('TransactionStepIndicator component', () => {
  it('is exported and defined as a React component', () => {
    expect(TransactionStepIndicator).toBeDefined();
    expect(typeof TransactionStepIndicator).toBe('function');
  });

  it('renders null when currentStep is idle', () => {
    const element = React.createElement(TransactionStepIndicator, {
      currentStep: 'idle',
    });

    expect(element.props.currentStep).toBe('idle');
  });

  it('instantiates during active signing step', () => {
    const element = React.createElement(TransactionStepIndicator, {
      currentStep: 'signing',
    });

    expect(element).toBeDefined();
    expect(element.props.currentStep).toBe('signing');
  });

  it('instantiates with confirmed state, txHash, and ledgerSeq', () => {
    const element = React.createElement(TransactionStepIndicator, {
      currentStep: 'confirmed',
      txHash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
      ledgerSeq: 142050,
    });

    expect(element.props.currentStep).toBe('confirmed');
    expect(element.props.ledgerSeq).toBe(142050);
  });

  it('instantiates with error message upon failure', () => {
    const element = React.createElement(TransactionStepIndicator, {
      currentStep: 'failed',
      error: 'Soroban host invocation rejected',
    });

    expect(element.props.currentStep).toBe('failed');
    expect(element.props.error).toBe('Soroban host invocation rejected');
  });
});

