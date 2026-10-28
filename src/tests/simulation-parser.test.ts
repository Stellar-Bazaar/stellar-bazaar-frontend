import { describe, it, expect } from 'vitest';
import {
  parseSimulationResponse,
  calculateTotalFee,
  SorobanSimulationResponse,
} from '../services/simulation-parser';

describe('simulation-parser service', () => {
  it('parses realistic Soroban RPC simulation response', () => {
    const mockRpc: SorobanSimulationResponse = {
      latestLedger: 142050,
      minResourceFee: '125000', // 125,000 stroops resource fee
      cost: {
        cpuInsns: '1540200',
        memBytes: '65400',
      },
      results: [
        {
          auth: ['AAAAFA==', 'BBBBGA=='],
          xdr: 'AAAAAQ==',
        },
      ],
      transactionData: 'DATA_XDR_STRING',
    };

    const res = parseSimulationResponse(mockRpc);
    expect(res.success).toBe(true);
    expect(res.minResourceFeeStroops).toBe(125_000n);
    expect(res.cpuInstructions).toBe(1_540_200n);
    expect(res.ramBytes).toBe(65_400n);
    expect(res.authCount).toBe(2);
    expect(res.transactionDataXdr).toBe('DATA_XDR_STRING');
    expect(res.errorDetails).toBeUndefined();
  });

  it('correctly handles RPC execution error', () => {
    const mockRpc: Partial<SorobanSimulationResponse> = {
      error: 'HostError: Error(Contract, #12)',
    };

    const res = parseSimulationResponse(mockRpc);
    expect(res.success).toBe(false);
    expect(res.minResourceFeeStroops).toBe(0n);
    expect(res.errorDetails).toBe('HostError: Error(Contract, #12)');
  });

  it('handles empty response gracefully', () => {
    const res = parseSimulationResponse({});
    expect(res.success).toBe(true);
    expect(res.minResourceFeeStroops).toBe(0n);
    expect(res.cpuInstructions).toBe(0n);
    expect(res.authCount).toBe(0);
  });

  it('computes combined total fee accurately', () => {
    // Base fee: 100 stroops, Resource fee: 125,000 stroops
    // Total = 125,100 stroops
    const total = calculateTotalFee(100, 125_000n);
    expect(total).toBe(125_100n);

    // Enforces minimum 100 stroops base fee
    const zeroBaseTotal = calculateTotalFee(0, 50_000n);
    expect(zeroBaseTotal).toBe(50_100n);
  });
});
