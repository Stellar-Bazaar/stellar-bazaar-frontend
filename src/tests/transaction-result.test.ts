import { describe, it, expect } from 'vitest';
import { parseHorizonError } from '../services/stellar-horizon';

describe('Stellar Horizon Error Interpretation', () => {
  it('parses user signature denial correctly', () => {
    const errorString = 'User denied transaction signature';
    expect(parseHorizonError(errorString)).toBe(
      'Transaction signature was rejected by user.'
    );

    const errorObj = { message: 'Transaction was rejected by Freighter' };
    expect(parseHorizonError(errorObj)).toBe(
      'Transaction signature was rejected by the wallet.'
    );
  });

  it('translates Horizon op_underfunded to human-readable message', () => {
    const errorObj = {
      response: {
        data: {
          extras: {
            result_codes: {
              operations: ['op_underfunded'],
            },
          },
        },
      },
    };

    const msg = parseHorizonError(errorObj);
    expect(msg).toContain('Source account does not have sufficient XLM');
  });

  it('translates op_no_destination to inactive account explanation', () => {
    const errorObj = {
      response: {
        data: {
          extras: {
            result_codes: {
              operations: ['op_no_destination'],
            },
          },
        },
      },
    };

    const msg = parseHorizonError(errorObj);
    expect(msg).toContain('destination account has not been activated yet');
  });

  it('translates 404 response to unfunded account prompt', () => {
    const errorObj = {
      response: {
        status: 404,
      },
    };

    const msg = parseHorizonError(errorObj);
    expect(msg).toContain('Account not found on Stellar Testnet');
    expect(msg).toContain('Friendbot');
  });

  it('translates tx_bad_seq to sequence desynchronization explanation', () => {
    const errorObj = {
      response: {
        data: {
          extras: {
            result_codes: {
              transaction: 'tx_bad_seq',
            },
          },
        },
      },
    };

    const msg = parseHorizonError(errorObj);
    expect(msg).toContain('Account sequence out of sync');
  });
});
