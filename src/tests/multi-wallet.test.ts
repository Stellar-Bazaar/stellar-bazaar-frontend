import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WalletManager } from '../services/wallet-manager';

vi.mock('../services/stellar-horizon', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/stellar-horizon')>();
  return {
    ...actual,
    fundWithFriendbot: vi.fn().mockResolvedValue(true),
  };
});

describe('Multi-Wallet Management', () => {
  beforeEach(async () => {
    await WalletManager.disconnect();
    vi.restoreAllMocks();
  });

  it('lists all supported wallet options including Freighter, xBull, Albedo, Hana, and Companion', async () => {
    const wallets = await WalletManager.getAvailableWallets();
    expect(wallets.length).toBe(5);

    const ids = wallets.map((w) => w.id);
    expect(ids).toContain('FREIGHTER');
    expect(ids).toContain('XBULL');
    expect(ids).toContain('ALBEDO');
    expect(ids).toContain('HANA');
    expect(ids).toContain('COMPANION');
  });

  it('connects to Testnet Companion Signer and sets active account correctly', async () => {
    const account = await WalletManager.connect('COMPANION');
    expect(account.type).toBe('COMPANION');
    expect(account.isTestnet).toBe(true);
    expect(account.network).toBe('TESTNET');
    expect(account.address.startsWith('G')).toBe(true);
    expect(account.address.length).toBe(56);
    expect(account.shortAddress.length).toBeLessThan(account.address.length);
    expect(WalletManager.getActiveWalletType()).toBe('COMPANION');
  });

  it('handles disconnection cleanly', async () => {
    await WalletManager.connect('COMPANION');
    expect(WalletManager.getActiveWalletType()).toBe('COMPANION');

    await WalletManager.disconnect();
    expect(WalletManager.getActiveWalletType()).toBeNull();
  });

  it('throws an error when signing transaction without an active connection', async () => {
    await expect(WalletManager.signTransaction('fake-xdr')).rejects.toThrow(
      'No active wallet connected'
    );
  });

  it('throws a helpful error when connecting an unavailable extension like xBull without window.xBullSDK', async () => {
    await expect(WalletManager.connect('XBULL')).rejects.toThrow(
      'xBull Wallet extension was not detected'
    );
  });

  it('throws a helpful error when connecting Hana without window.hanaWallet', async () => {
    await expect(WalletManager.connect('HANA')).rejects.toThrow(
      'Hana Wallet extension was not detected'
    );
  });
});
