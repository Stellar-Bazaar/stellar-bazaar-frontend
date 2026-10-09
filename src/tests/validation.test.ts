import { describe, it, expect } from 'vitest';
import {
  isValidStellarAddress,
  validateAmount,
  validateMemo,
  validatePaymentForm,
  shortenAddress,
} from '../services/validation';

describe('Stellar Address Validation', () => {
  const VALID_ADDR_1 = 'GAFAVMHP54H3DRZU7RJPOIV5N7KEYC5F7XFKX3YXMYYZB2VBZBJG5PJZ';
  const VALID_ADDR_2 = 'GDDORMQNYWG2ZFBACPDAIOI65MFP5X6L6MYFLSUNRQOCDR4CTROKAGQY';

  it('validates legitimate Stellar Ed25519 public keys', () => {
    expect(isValidStellarAddress(VALID_ADDR_1)).toBe(true);
    expect(isValidStellarAddress(VALID_ADDR_2)).toBe(true);
  });

  it('rejects addresses with invalid lengths or checksums', () => {
    expect(isValidStellarAddress('')).toBe(false);
    expect(isValidStellarAddress('GABC123')).toBe(false);
    expect(isValidStellarAddress('SAFAVMHP54H3DRZU7RJPOIV5N7KEYC5F7XFKX3YXMYYZB2VBZBJG5PJZ')).toBe(false); // Secret key format 'S'
    expect(isValidStellarAddress('0x71C84166b3a967c1309CE6A795261804Ea53be8D')).toBe(false); // EVM address
    expect(isValidStellarAddress('GAFAVMHP54H3DRZU7RJPOIV5N7KEYC5F7XFKX3YXMYYZB2VBZBJG5999')).toBe(false); // Bad checksum
  });

  it('shortens addresses for readable display', () => {
    expect(shortenAddress(VALID_ADDR_1, 4)).toBe('GAFA...5PJZ');
    expect(shortenAddress(VALID_ADDR_2, 6)).toBe('GDDORM...OKAGQY');
  });
});

describe('XLM Amount Validation', () => {
  it('accepts valid numeric positive amounts', () => {
    const res1 = validateAmount('10');
    expect(res1.isValid).toBe(true);
    expect(res1.parsedAmount).toBe(10);

    const res2 = validateAmount('0.5');
    expect(res2.isValid).toBe(true);
    expect(res2.parsedAmount).toBe(0.5);

    const res3 = validateAmount('123.4567890'); // 7 decimals
    expect(res3.isValid).toBe(true);
  });

  it('rejects zero, negative, and invalid string amounts', () => {
    expect(validateAmount('0').isValid).toBe(false);
    expect(validateAmount('-5').isValid).toBe(false);
    expect(validateAmount('not_a_number').isValid).toBe(false);
    expect(validateAmount('').isValid).toBe(false);
    expect(validateAmount('1.2.3').isValid).toBe(false);
  });

  it('rejects precision greater than 7 decimal places (1 Stroop limit)', () => {
    const res = validateAmount('1.12345678'); // 8 decimals
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('maximum precision of 7 decimal places');
  });

  it('enforces spendable balance and minimum base reserve (1 XLM)', () => {
    // Current balance: 10 XLM, max spendable: 9 XLM
    const resWithin = validateAmount('8.5', 10);
    expect(resWithin.isValid).toBe(true);

    const resExceeding = validateAmount('9.5', 10);
    expect(resExceeding.isValid).toBe(false);
    expect(resExceeding.error).toContain('Insufficient spendable balance');
  });
});

describe('Transaction Memo Validation', () => {
  it('validates memo byte length limits (max 28 bytes)', () => {
    expect(validateMemo('').isValid).toBe(true);
    expect(validateMemo('Short memo').isValid).toBe(true);
    expect(validateMemo('1234567890123456789012345678').isValid).toBe(true); // 28 bytes
    expect(validateMemo('12345678901234567890123456789').isValid).toBe(false); // 29 bytes
  });
});

describe('Payment Form Combined Validation', () => {
  const SENDER = 'GAFAVMHP54H3DRZU7RJPOIV5N7KEYC5F7XFKX3YXMYYZB2VBZBJG5PJZ';
  const RECIPIENT = 'GDDORMQNYWG2ZFBACPDAIOI65MFP5X6L6MYFLSUNRQOCDR4CTROKAGQY';

  it('validates complete valid payment forms', () => {
    const { isValid, errors } = validatePaymentForm(
      {
        destinationAddress: RECIPIENT,
        amount: '5.0',
        memo: 'Order #123',
      },
      SENDER,
      20
    );

    expect(isValid).toBe(true);
    expect(errors.destinationAddress).toBeUndefined();
    expect(errors.amount).toBeUndefined();
  });

  it('rejects self-transfers to source address', () => {
    const { isValid, errors } = validatePaymentForm(
      {
        destinationAddress: SENDER,
        amount: '5.0',
        memo: '',
      },
      SENDER,
      20
    );

    expect(isValid).toBe(false);
    expect(errors.destinationAddress).toContain('cannot be your own wallet address');
  });
});
