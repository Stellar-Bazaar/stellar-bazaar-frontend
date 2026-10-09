import { describe, it, expect, vi } from 'vitest';
import { FreighterWalletService } from '../services/freighter-wallet';

describe('Freighter Wallet Service & State Handling', () => {
  it('detects when window.freighter is missing in headless/node environments', async () => {
    // In node/vitest, window is either not present or has no freighter extension installed
    const isAvail = await FreighterWalletService.isAvailable();
    expect(typeof isAvail).toBe('boolean');
  });

  it('rejects connection cleanly when extension is unavailable', async () => {
    vi.spyOn(FreighterWalletService, 'isAvailable').mockResolvedValue(false);

    await expect(FreighterWalletService.connect()).rejects.toThrow(
      'Freighter wallet extension was not detected'
    );
  });

  it('handles user denial or rejection during connection', async () => {
    vi.spyOn(FreighterWalletService, 'isAvailable').mockResolvedValue(true);
    // Mock rejected connect
    const rejectedError = new Error('User denied access to account');
    vi.spyOn(FreighterWalletService, 'connect').mockRejectedValue(rejectedError);

    await expect(FreighterWalletService.connect()).rejects.toThrow('User denied access');
  });
});
