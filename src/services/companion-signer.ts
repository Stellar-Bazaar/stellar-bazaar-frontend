import { Keypair, TransactionBuilder, Networks } from '@stellar/stellar-sdk';
import { fundWithFriendbot } from './stellar-horizon';

const STORAGE_KEY = 'stellar_bazaar_testnet_companion';

export interface CompanionAccount {
  publicKey: string;
  secretKey: string;
}

// Store securely in memory rather than sessionStorage to prevent XSS exposure of private keys
let inMemoryCompanion: CompanionAccount | null = null;

export class CompanionSignerService {
  /**
   * Retrieves or creates an active Testnet Keypair funded via Friendbot.
   */
  public static async getOrCreateCompanion(): Promise<CompanionAccount> {
    if (inMemoryCompanion) {
      return inMemoryCompanion;
    }

    // Generate fresh Keypair
    const pair = Keypair.random();
    const companion: CompanionAccount = {
      publicKey: pair.publicKey(),
      secretKey: pair.secret(),
    };

    // Auto-fund with Friendbot
    await fundWithFriendbot(companion.publicKey);

    inMemoryCompanion = companion;
    return companion;
  }

  /**
   * Signs a transaction XDR with the companion keypair.
   */
  public static signTransaction(xdr: string, secretKey: string): string {
    const keypair = Keypair.fromSecret(secretKey);
    const tx = TransactionBuilder.fromXDR(xdr, Networks.TESTNET);
    tx.sign(keypair);
    return tx.toXDR();
  }

  public static clear(): void {
    inMemoryCompanion = null;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }
}
