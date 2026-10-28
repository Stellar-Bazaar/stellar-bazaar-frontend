import { describe, it, expect } from 'vitest';
import {
  decodeSorobanError,
  CONTRACT_ERROR_MAP,
  UNKNOWN_SOROBAN_ERROR,
} from '../utils/soroban-error-decoder';

describe('SorobanErrorDecoder', () => {
  it('decodes numeric error codes directly', () => {
    const error1 = decodeSorobanError(1);
    expect(error1.name).toBe('AlreadyInitialized');
    expect(error1.code).toBe(1);

    const error21 = decodeSorobanError(21);
    expect(error21.name).toBe('NotUnderInspection');
    expect(error21.title).toBe('Deal Not Under Inspection');

    const error26 = decodeSorobanError(26);
    expect(error26.name).toBe('NoSurplusRebate');

    const error27 = decodeSorobanError(27);
    expect(error27.name).toBe('AlreadyClaimedRebate');
  });

  it('parses Soroban HostError string format with # syntax', () => {
    const rawMsg = 'HostError: Error(Contract, #22)';
    const decoded = decodeSorobanError(new Error(rawMsg));
    expect(decoded.code).toBe(22);
    expect(decoded.name).toBe('DisputeAlreadyOpen');
  });

  it('parses Soroban error without hash symbol', () => {
    const rawMsg = 'Transaction simulation failed: Error(Contract, 25)';
    const decoded = decodeSorobanError(rawMsg);
    expect(decoded.code).toBe(25);
    expect(decoded.name).toBe('InvalidFeeBps');
  });

  it('parses user wallet rejection messages', () => {
    const decoded = decodeSorobanError(new Error('User rejected the transaction in Freighter'));
    expect(decoded.code).toBe(102);
    expect(decoded.name).toBe('UserRejected');
  });

  it('parses insufficient balance messages', () => {
    const decoded = decodeSorobanError('op_underfunded: insufficient balance to cover stroop reserve');
    expect(decoded.code).toBe(101);
    expect(decoded.name).toBe('InsufficientBalance');
  });

  it('gracefully handles unmapped error codes', () => {
    const decoded = decodeSorobanError(999);
    expect(decoded.code).toBe(999);
    expect(decoded.name).toBe('UnknownContractError');
    expect(decoded.explanation).toContain('#999');
  });

  it('handles completely unknown error shapes', () => {
    const decoded = decodeSorobanError(null);
    expect(decoded.code).toBe(0);
    expect(decoded.name).toBe(UNKNOWN_SOROBAN_ERROR.name);
  });

  it('has comprehensive mappings for all 27 contract errors', () => {
    for (let i = 1; i <= 27; i++) {
      expect(CONTRACT_ERROR_MAP[i]).toBeDefined();
      expect(CONTRACT_ERROR_MAP[i].title.length).toBeGreaterThan(0);
      expect(CONTRACT_ERROR_MAP[i].explanation.length).toBeGreaterThan(0);
      expect(CONTRACT_ERROR_MAP[i].remediation.length).toBeGreaterThan(0);
    }
  });
});
