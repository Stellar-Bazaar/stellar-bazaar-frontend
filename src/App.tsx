import React, { useState, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { TestnetBanner } from './components/TestnetBanner';
import { BalanceCard } from './components/BalanceCard';
import { PaymentForm } from './components/PaymentForm';
import { DemandCirclesSection } from './components/DemandCirclesSection';
import { WalletModal } from './components/WalletModal';
import { Toast, ToastMessage } from './components/Toast';
import {
  WalletAccount,
  WalletStatus,
  AccountBalanceState,
} from './types/wallet';
import {
  PaymentFormValues,
  PaymentStatus,
  TransactionConfirmation,
} from './types/payment';
import {
  fetchAccountBalances,
  buildPaymentTransactionXdr,
  submitSignedTransaction,
  fundWithFriendbot,
  EXPLORER_BASE_URL,
} from './services/stellar-horizon';
import { FreighterWalletService } from './services/freighter-wallet';
import {
  CompanionSignerService,
  CompanionAccount,
} from './services/companion-signer';
import { shortenAddress } from './services/validation';
import { ArrowRight, Sparkles, Lock } from 'lucide-react';

export const App: React.FC = () => {
  // Wallet State
  const [walletAccount, setWalletAccount] = useState<WalletAccount | null>(null);
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('DISCONNECTED');
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [companionAccount, setCompanionAccount] = useState<CompanionAccount | null>(null);

  // Balance State
  const [balanceState, setBalanceState] = useState<AccountBalanceState>({
    xlm: '0.0000000',
    balances: [],
    isFunded: false,
    lastFetchedAt: null,
    isLoading: false,
    error: null,
  });
  const [isFunding, setIsFunding] = useState(false);

  // Payment State
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('IDLE');
  const [paymentStatusMessage, setPaymentStatusMessage] = useState<string | undefined>();
  const [confirmation, setConfirmation] = useState<TransactionConfirmation | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'SUCCESS' | 'ERROR' | 'INFO', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Balance Refresh
  const refreshBalance = useCallback(async (address: string) => {
    setBalanceState((prev) => ({ ...prev, isLoading: true }));
    try {
      const res = await fetchAccountBalances(address);
      setBalanceState(res);
    } catch (err: any) {
      setBalanceState((prev) => ({
        ...prev,
        isLoading: false,
        error: err?.message || 'Failed to refresh balance.',
      }));
    }
  }, []);

  // Handle Connect with Freighter
  const handleConnectFreighter = async () => {
    setWalletStatus('CONNECTING');
    setWalletError(null);
    try {
      const res = await FreighterWalletService.connect();
      const account: WalletAccount = {
        address: res.address,
        shortAddress: shortenAddress(res.address),
        network: res.network,
        isTestnet: res.isTestnet,
        type: 'FREIGHTER',
      };
      setWalletAccount(account);
      setWalletStatus('CONNECTED');
      setWalletModalOpen(false);
      addToast('SUCCESS', `Connected Freighter: ${shortenAddress(res.address)}`);
      refreshBalance(res.address);
    } catch (err: any) {
      setWalletStatus('ERROR');
      setWalletError(err?.message || 'Failed to connect to Freighter.');
      addToast('ERROR', err?.message || 'Failed to connect to Freighter.');
    }
  };

  // Handle Connect with Companion Testnet Signer
  const handleConnectCompanion = async () => {
    setWalletStatus('CONNECTING');
    setWalletError(null);
    try {
      const companion = await CompanionSignerService.getOrCreateCompanion();
      setCompanionAccount(companion);
      const account: WalletAccount = {
        address: companion.publicKey,
        shortAddress: shortenAddress(companion.publicKey),
        network: 'TESTNET',
        isTestnet: true,
        type: 'COMPANION',
      };
      setWalletAccount(account);
      setWalletStatus('CONNECTED');
      setWalletModalOpen(false);
      addToast('SUCCESS', `Connected Testnet Companion: ${shortenAddress(companion.publicKey)}`);
      refreshBalance(companion.publicKey);
    } catch (err: any) {
      setWalletStatus('ERROR');
      setWalletError(err?.message || 'Failed to initialize Testnet companion.');
      addToast('ERROR', err?.message || 'Failed to initialize Testnet companion.');
    }
  };

  // Disconnect
  const handleDisconnect = () => {
    setWalletAccount(null);
    setWalletStatus('DISCONNECTED');
    setCompanionAccount(null);
    setBalanceState({
      xlm: '0.0000000',
      balances: [],
      isFunded: false,
      lastFetchedAt: null,
      isLoading: false,
      error: null,
    });
    setConfirmation(null);
    setPaymentError(null);
    setPaymentStatus('IDLE');
    addToast('INFO', 'Wallet disconnected cleanly.');
  };

  // Faucet Request
  const handleFundFaucet = async () => {
    if (!walletAccount?.address) return;
    setIsFunding(true);
    addToast('INFO', 'Requesting 10,000 XLM from Stellar Friendbot...');
    try {
      const ok = await fundWithFriendbot(walletAccount.address);
      if (ok) {
        addToast('SUCCESS', 'Account funded with 10,000 Testnet XLM!');
        await refreshBalance(walletAccount.address);
      } else {
        addToast('ERROR', 'Friendbot request failed. Please retry.');
      }
    } finally {
      setIsFunding(false);
    }
  };

  // Submit Payment
  const handleSubmitPayment = async (values: PaymentFormValues) => {
    if (!walletAccount?.address) {
      addToast('ERROR', 'Please connect your wallet first.');
      return;
    }

    setPaymentError(null);
    setConfirmation(null);

    try {
      // Step 1: Building Transaction
      setPaymentStatus('BUILDING_TRANSACTION');
      setPaymentStatusMessage('Building transaction envelope on Stellar Testnet...');
      const xdr = await buildPaymentTransactionXdr({
        sourceAddress: walletAccount.address,
        destinationAddress: values.destinationAddress.trim(),
        amount: values.amount.trim(),
        memo: values.memo,
      });

      // Step 2: Signing Transaction
      setPaymentStatus('AWAITING_WALLET_SIGNATURE');
      setPaymentStatusMessage(
        walletAccount.type === 'FREIGHTER'
          ? 'Please review and approve the transaction in the Freighter popup window...'
          : 'Signing transaction envelope with Testnet Companion Keypair...'
      );

      let signedXdr: string;
      if (walletAccount.type === 'FREIGHTER') {
        signedXdr = await FreighterWalletService.signTransaction(xdr);
      } else if (companionAccount) {
        signedXdr = CompanionSignerService.signTransaction(xdr, companionAccount.secretKey);
      } else {
        throw new Error('No active signing provider found.');
      }

      // Step 3: Submitting to Testnet
      setPaymentStatus('SUBMITTING_TO_TESTNET');
      setPaymentStatusMessage('Broadcasting signed transaction to Stellar Testnet Horizon...');
      const result = await submitSignedTransaction(signedXdr);

      // Step 4: Success Confirmed
      const confirmationRecord: TransactionConfirmation = {
        hash: result.hash,
        ledger: result.ledger,
        submittedAt: new Date(),
        destination: values.destinationAddress.trim(),
        amount: values.amount.trim(),
        explorerUrl: `${EXPLORER_BASE_URL}/tx/${result.hash}`,
      };

      setConfirmation(confirmationRecord);
      setPaymentStatus('CONFIRMED');
      setPaymentStatusMessage(undefined);
      addToast('SUCCESS', `Transaction confirmed in ledger #${result.ledger}!`);

      // Refresh balance after successful payment
      await refreshBalance(walletAccount.address);
    } catch (err: any) {
      setPaymentStatus('FAILED');
      setPaymentStatusMessage(undefined);
      const errMsg = err?.message || 'Payment submission failed.';
      setPaymentError(errMsg);
      addToast('ERROR', errMsg);
    }
  };

  return (
    <div className="app-container">
      {/* Testnet Warning Banner */}
      <TestnetBanner />

      {/* Navigation */}
      <Navbar
        walletAccount={walletAccount}
        walletStatus={walletStatus}
        onOpenConnectModal={() => setWalletModalOpen(true)}
        onDisconnect={handleDisconnect}
        onCopyAddress={(addr) => {
          navigator.clipboard.writeText(addr);
          addToast('INFO', `Copied address: ${shortenAddress(addr)}`);
        }}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Hero Section */}
        <div style={{ textAlign: 'center', margin: '2rem auto 3rem', maxWidth: '780px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              marginBottom: '1.25rem',
              fontSize: '0.825rem',
              color: 'var(--accent-primary-light)',
              fontWeight: 600,
            }}
          >
            <Sparkles size={14} />
            <span>Demand-Driven Commerce on Soroban & Stellar Testnet</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.25rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: '1rem',
              lineHeight: 1.15,
            }}
          >
            Aggregate Buyer Demand.{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #818cf8 0%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Compete on Price.
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
            }}
          >
            Stellar Bazaar coordinates collective consumer demand into Demand Circles. Sellers submit competitive fulfillment quotes, and Soroban smart contracts enforce custody, escrow, and milestone settlement.
          </p>
        </div>

        {/* Core Operations Dashboard: Balance Card + Payment Form */}
        {walletStatus === 'CONNECTED' && walletAccount ? (
          <div className="dashboard-grid">
            {/* Left: Real Testnet Payment Interface */}
            <PaymentForm
              sourceAddress={walletAccount.address}
              currentBalanceXlm={Number(balanceState.xlm)}
              paymentStatus={paymentStatus}
              statusMessage={paymentStatusMessage}
              confirmation={confirmation}
              errorMessage={paymentError}
              onSubmitPayment={handleSubmitPayment}
              onResetConfirmation={() => {
                setConfirmation(null);
                setPaymentStatus('IDLE');
              }}
            />

            {/* Right: Real Balance Card */}
            <BalanceCard
              balanceState={balanceState}
              onRefresh={() => refreshBalance(walletAccount.address)}
              onFundWithFaucet={handleFundFaucet}
              isFunding={isFunding}
            />
          </div>
        ) : (
          /* Disconnected State Callout */
          <div
            className="glass-card"
            style={{
              textAlign: 'center',
              padding: '3rem 2rem',
              maxWidth: '680px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              <Lock size={26} color="var(--accent-primary-light)" />
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
              Connect Your Wallet to Access Testnet Payments
            </h2>
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.95rem',
                maxWidth: '520px',
                margin: '0 auto 1.75rem',
                lineHeight: 1.6,
              }}
            >
              Connect with Freighter or initiate an instant Testnet Companion account to retrieve your real Testnet XLM balance and submit signed transactions.
            </p>

            <button
              type="button"
              id="btn-hero-connect"
              className="btn btn-primary"
              onClick={() => setWalletModalOpen(true)}
              style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}
            >
              <span>Connect Wallet</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Demand Circles Section */}
        <DemandCirclesSection
          onSelectCircleForPayment={(circle) => {
            if (walletStatus !== 'CONNECTED') {
              setWalletModalOpen(true);
            } else {
              addToast(
                'INFO',
                `Selected ${circle.title}. Fill destination address to fund circle escrow.`
              );
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }
          }}
        />
      </main>

      {/* Wallet Connect Modal */}
      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onConnectFreighter={handleConnectFreighter}
        onConnectCompanion={handleConnectCompanion}
        isConnecting={walletStatus === 'CONNECTING'}
        errorMessage={walletError}
      />

      {/* Notifications Toast */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
