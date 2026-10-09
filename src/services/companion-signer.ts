import { Keypair, TransactionBuilder, Networks } from '@stellar/stellar-sdk';
import { fundWithFriendbot } from './stellar-horizon';

const STORAGE_KEY = 'stellar_bazaar_testnet_companion';

export interface CompanionAccount {
  publicKey: string;
  secretKey: string;
}

export class CompanionSignerService {
  /**
   * Retrieves or creates an active Testnet Keypair funded via Friendbot.
   */
  public static async getOrCreateCompanion(): Promise<CompanionAccount> {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.publicKey && parsed.secretKey) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    // Generate fresh Keypair
    const pair = Keypair.random();
    const companion: CompanionAccount = {
      publicKey: pair.publicKey(),
      secretKey: pair.secret(),
    };

    // Auto-fund with Friendbot
    await fundWithFriendbot(companion.publicKey);

    // Save to session memory
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(companion));
    } catch {
      // ignore
    }

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
    sessionStorage.removeItem(STORAGE_KEY);
  }
}
