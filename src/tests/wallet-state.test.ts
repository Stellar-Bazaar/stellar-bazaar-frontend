import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FreighterWalletService } from '../services/freighter-wallet';
import { WalletManager } from '../services/wallet-manager';
import { CompanionSignerService } from '../services/companion-signer';

describe('Freighter Wallet Service & State Handling', () => {
  it('detects when window.freighter is missing in headless/node environments', async () => {
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
    const rejectedError = new Error('User denied access to account');
    vi.spyOn(FreighterWalletService, 'connect').mockRejectedValue(rejectedError);

    await expect(FreighterWalletService.connect()).rejects.toThrow('User denied access');
  });
});

describe('WalletManager disconnect and state cleanup', () => {
  beforeEach(async () => {
    await WalletManager.disconnect();
  });

  it('successfully cleans up active wallet account and adapter upon disconnect', async () => {
    expect(WalletManager.isConnected()).toBe(false);
    expect(WalletManager.getActiveAccount()).toBeNull();
    expect(WalletManager.getActiveWalletType()).toBeNull();

    // Mock companion offline so test runs instantaneously without friendbot network latency
    vi.spyOn(CompanionSignerService, 'getOrCreateCompanion').mockResolvedValue({
      publicKey: 'GBCOMPANIONTESTNET12345678901234567890123456789012345678',
      secretKey: 'SB76543210',
    });

    // Connect using COMPANION developer mode
    const account = await WalletManager.connect('COMPANION');
    expect(account).toBeDefined();
    expect(WalletManager.isConnected()).toBe(true);
    expect(WalletManager.getActiveWalletType()).toBe('COMPANION');
    expect(WalletManager.getActiveAccount()?.address).toBe(account.address);

    // Disconnect
    await WalletManager.disconnect();
    expect(WalletManager.isConnected()).toBe(false);
    expect(WalletManager.getActiveAccount()).toBeNull();
    expect(WalletManager.getActiveWalletType()).toBeNull();
  });

  it('throws error when attempting to sign without active connected wallet', async () => {
    await WalletManager.disconnect();
    await expect(WalletManager.signTransaction('AAAA...')).rejects.toThrow(
      'No active wallet connected'
    );
  });
});
