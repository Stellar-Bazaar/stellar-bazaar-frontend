import React, { useState, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { TestnetBanner } from './components/TestnetBanner';
import { BalanceCard } from './components/BalanceCard';
import { PaymentForm } from './components/PaymentForm';
import { DemandCirclesSection } from './components/DemandCirclesSection';
import { WalletModal } from './components/WalletModal';
import { CreateCircleModal } from './components/CreateCircleModal';
import { CircleDetailModal } from './components/CircleDetailModal';
import { Toast, ToastMessage } from './components/Toast';
import {
  WalletAccount,
  WalletStatus,
  WalletType,
  AccountBalanceState,
} from './types/wallet';
import {
  PaymentFormValues,
  PaymentStatus,
  TransactionConfirmation,
} from './types/payment';
import { OnChainDemandCircle } from './types/contract';
import {
  fetchAccountBalances,
  buildPaymentTransactionXdr,
  submitSignedTransaction,
  fundWithFriendbot,
  EXPLORER_BASE_URL,
} from './services/stellar-horizon';
import { WalletManager } from './services/wallet-manager';
import { shortenAddress } from './services/validation';
import { ArrowRight, Sparkles, Lock } from 'lucide-react';

export const App: React.FC = () => {
  // Wallet State
  const [walletAccount, setWalletAccount] = useState<WalletAccount | null>(null);
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('DISCONNECTED');
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

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

  // Demand Circle Modals & Sync
  const [createCircleModalOpen, setCreateCircleModalOpen] = useState(false);
  const [selectedCircleDetails, setSelectedCircleDetails] = useState<OnChainDemandCircle | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'SUCCESS' | 'ERROR' | 'INFO', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
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

  // Multi-Wallet Selection & Connection
  const handleSelectWallet = async (type: WalletType) => {
    setWalletStatus('CONNECTING');
    setWalletError(null);
    try {
      const account = await WalletManager.connect(type);
      setWalletAccount(account);
      setWalletStatus('CONNECTED');
      setWalletModalOpen(false);
      addToast('SUCCESS', `Connected to ${account.type} (${account.shortAddress})`);
      await refreshBalance(account.address);
    } catch (err: any) {
      setWalletStatus('ERROR');
      const msg = err?.message || `Failed to connect to ${type}.`;
      setWalletError(msg);
      addToast('ERROR', msg);
    }
  };

  // Disconnect
  const handleDisconnect = async () => {
    await WalletManager.disconnect();
    setWalletAccount(null);
    setWalletStatus('DISCONNECTED');
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

  // Friendbot Faucet Request
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

  // Submit Payment / Circle Escrow Funding
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

      // Step 2: Signing Transaction with active wallet
      setPaymentStatus('AWAITING_WALLET_SIGNATURE');
      setPaymentStatusMessage(
        walletAccount.type === 'FREIGHTER'
          ? 'Please review and approve the transaction in the Freighter extension...'
          : `Please authorize the transaction in your ${walletAccount.type} wallet...`
      );

      const signedXdr = await WalletManager.signTransaction(xdr);

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

  // Handle Circle Created
  const handleCircleCreated = (circleId: number, txHash: string) => {
    addToast('SUCCESS', `Demand Circle #${circleId} recorded on Soroban! Tx: ${txHash.slice(0, 8)}...`);
    setRefreshTrigger((prev) => prev + 1);
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
            Stellar Bazaar coordinates collective consumer demand into Demand Circles. Sellers submit competitive fulfillment quotes, and Soroban smart contracts enforce commercial rules and escrow settlement.
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
              Connect Your Wallet to Access Demand Circles & Payments
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
              Connect with Freighter, xBull, Albedo, Hana, or an instant Testnet Companion account to retrieve your real Testnet balance and interact with Soroban smart contracts.
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
          onOpenCreateCircle={() => setCreateCircleModalOpen(true)}
          onSelectCircleDetails={(circle) => setSelectedCircleDetails(circle)}
          onSelectCircleForPayment={(circle) => {
            if (walletStatus !== 'CONNECTED') {
              setWalletModalOpen(true);
            } else {
              addToast(
                'INFO',
                `Selected Circle #${circle.id} ("${circle.title}"). Form ready for escrow payment.`
              );
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }
          }}
          walletConnected={walletStatus === 'CONNECTED'}
          refreshTrigger={refreshTrigger}
        />
      </main>

      {/* Multi-Wallet Connect Modal */}
      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onSelectWallet={handleSelectWallet}
        isConnecting={walletStatus === 'CONNECTING'}
        activeWalletType={walletAccount?.type || null}
        errorMessage={walletError}
      />

      {/* Create Demand Circle Modal */}
      {walletAccount && (
        <CreateCircleModal
          isOpen={createCircleModalOpen}
          onClose={() => setCreateCircleModalOpen(false)}
          creatorAddress={walletAccount.address}
          onCircleCreated={handleCircleCreated}
        />
      )}

      {/* Demand Circle Detail Modal */}
      <CircleDetailModal
        circle={selectedCircleDetails}
        onClose={() => setSelectedCircleDetails(null)}
        onSelectForPayment={(circle) => {
          setSelectedCircleDetails(null);
          addToast('INFO', `Selected Circle #${circle.id} for payment.`);
          window.scrollTo({ top: 300, behavior: 'smooth' });
        }}
      />

      {/* Notifications Toast */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
