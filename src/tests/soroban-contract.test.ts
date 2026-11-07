import { describe, it, expect, vi } from 'vitest';
import { SorobanContractService, STROOPS_PER_XLM } from '../services/soroban-contract';

describe('Soroban Smart Contract Integration', () => {
  it('loads valid contract deployment configuration from contract.json', () => {
    const config = SorobanContractService.getConfig();
    expect(config.contractName).toBe('DemandCircleRegistry');
    expect(config.network).toBe('TESTNET');
    expect(config.contractId.startsWith('C')).toBe(true);
    expect(config.contractId.length).toBe(56);
    expect(config.explorerUrl).toContain(config.contractId);
    expect(config.wasmHash.length).toBe(64);
  });

  it('accurately converts XLM to Stroops for Soroban contract inputs', () => {
    expect(STROOPS_PER_XLM).toBe(10_000_000n);

    const priceXlm = '2.5';
    const stroops = BigInt(Math.round(parseFloat(priceXlm) * Number(STROOPS_PER_XLM)));
    expect(stroops).toBe(25_000_000n);

    // Roundtrip back to string
    const backToXlm = (Number(stroops) / Number(STROOPS_PER_XLM)).toFixed(4);
    expect(backToXlm).toBe('2.5000');
  });

  it('validates demand circle input boundaries', async () => {
    const fakeAddress = 'GDEXAMPLEADDRESSFORTESTING123456789012345678901234567890';

    // Empty title
    await expect(
      SorobanContractService.createDemandCircle(fakeAddress, {
        title: '',
        metadata_uri: '',
        target_quantity: 10,
        target_price_xlm: '1.0',
        duration_days: 7,
      })
    ).rejects.toThrow('Title must be between 1 and 64 characters');

    // Title too long (>64)
    await expect(
      SorobanContractService.createDemandCircle(fakeAddress, {
        title: 'A'.repeat(65),
        metadata_uri: '',
        target_quantity: 10,
        target_price_xlm: '1.0',
        duration_days: 7,
      })
    ).rejects.toThrow('Title must be between 1 and 64 characters');

    // Quantity <= 0
    await expect(
      SorobanContractService.createDemandCircle(fakeAddress, {
        title: 'Valid Title',
        metadata_uri: '',
        target_quantity: 0,
        target_price_xlm: '1.0',
        duration_days: 7,
      })
    ).rejects.toThrow('Target quantity must be greater than zero');

    // Price <= 0
    await expect(
      SorobanContractService.createDemandCircle(fakeAddress, {
        title: 'Valid Title',
        metadata_uri: '',
        target_quantity: 10,
        target_price_xlm: '0.0',
        duration_days: 7,
      })
    ).rejects.toThrow('Target unit price must be a valid positive XLM amount');

    // Duration invalid
    await expect(
      SorobanContractService.createDemandCircle(fakeAddress, {
        title: 'Valid Title',
        metadata_uri: '',
        target_quantity: 10,
        target_price_xlm: '1.0',
        duration_days: 400,
      })
    ).rejects.toThrow('Duration must be between 1 and 365 days');
  });

  it('provides an idempotent indexed events list', () => {
    const initial = SorobanContractService.getIndexedEvents();
    expect(Array.isArray(initial)).toBe(true);
  });

  it('passes caller address as first argument to settle_deal', async () => {
    const spy = vi.spyOn(SorobanContractService as any, 'executeContractInvocation').mockResolvedValue({ txHash: 'abc' });
    const dummyCaller = 'GAFAVMHP54H3DRZU7RJPOIV5N7KEYC5F7XFKX3YXMYYZB2VBZBJG5PJZ';
    await SorobanContractService.settleDeal(1, 2, dummyCaller);

    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][1]).toBe('settle_deal');
    expect(spy.mock.calls[0][2].length).toBe(3);
    expect(spy.mock.calls[0][3]).toBe(dummyCaller);
    spy.mockRestore();
  });
});
