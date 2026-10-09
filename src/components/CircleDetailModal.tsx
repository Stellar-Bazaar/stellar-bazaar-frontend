import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { OnChainDemandCircle, OnChainDeal, OnChainOffer, SellerReputation } from '../types/contract';
import { SorobanContractService } from '../services/soroban-contract';
import { WalletManager } from '../services/wallet-manager';

interface CircleDetailModalProps {
  circle: OnChainDemandCircle | null;
  onClose: () => void;
  onSelectForPayment?: (circle: OnChainDemandCircle) => void;
  onActionSuccess?: () => void;
}

type TabType = 'OVERVIEW' | 'COMMIT_BUYER' | 'SUBMIT_OFFER' | 'SETTLEMENT';

export const CircleDetailModal: React.FC<CircleDetailModalProps> = ({
  circle,
  onClose,
  onSelectForPayment: _onSelectForPayment,
  onActionSuccess,
}) => {
  const [copiedContract, setCopiedContract] = useState(false);
  const [copiedCreator, setCopiedCreator] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');

  // Authoritative Deal Engine state
  const [deal, setDeal] = useState<OnChainDeal | null>(null);
  const [offers, setOffers] = useState<OnChainOffer[]>([]);
  const [sellerReputations, setSellerReputations] = useState<Record<string, SellerReputation>>({});
  const [isLoadingDeal, setIsLoadingDeal] = useState(false);

  // Buyer commit form
  const [commitQty, setCommitQty] = useState(5);
  const [commitStatus, setCommitStatus] = useState<'IDLE' | 'PENDING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [commitTxHash, setCommitTxHash] = useState<string | null>(null);
  const [commitError, setCommitError] = useState<string | null>(null);

  // Seller offer form
  const [offerPriceXlm, setOfferPriceXlm] = useState('');
  const [offerVolume, setOfferVolume] = useState(20);
  const [offerLeadDays, setOfferLeadDays] = useState(5);
  const [offerStatus, setOfferStatus] = useState<'IDLE' | 'PENDING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [offerTxHash, setOfferTxHash] = useState<string | null>(null);
  const [offerError, setOfferError] = useState<string | null>(null);

  // Settlement & Refund status
  const [settleStatus, setSettleStatus] = useState<'IDLE' | 'PENDING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [settleTxHash, setSettleTxHash] = useState<string | null>(null);
  const [settleError, setSettleError] = useState<string | null>(null);

  const activeWallet = WalletManager.getActiveAccount();
  const isConnected = WalletManager.isConnected();
  const walletAddress = activeWallet?.address;
  const contractConfig = SorobanContractService.getConfig();

  // Load deal engine data
  const loadDealData = async () => {
    if (!circle) return;
    setIsLoadingDeal(true);
    try {
      const dealData = await SorobanContractService.getDealState(circle.id);
      if (dealData) {
        setDeal(dealData);
      }
      const circleOffers = await SorobanContractService.getCircleOffers(circle.id);
      setOffers(circleOffers);

      // Load reputation for sellers
      const repMap: Record<string, SellerReputation> = {};
      for (const off of circleOffers) {
        if (!repMap[off.seller]) {
          repMap[off.seller] = await SorobanContractService.getSellerReputation(off.seller);
        }
      }
      setSellerReputations(repMap);
    } catch (err) {
      console.warn('Deal engine query error:', err);
    } finally {
      setIsLoadingDeal(false);
    }
  };

  useEffect(() => {
    if (circle) {
      loadDealData();
      if (!offerPriceXlm) {
        // default offer slightly below target price to demonstrate savings
        const targetNum = parseFloat(circle.target_price_xlm);
        setOfferPriceXlm((targetNum * 0.9).toFixed(2));
      }
    }
  }, [circle]);

  if (!circle) return null;

  const handleCopy = (text: string, type: 'contract' | 'creator') => {
    navigator.clipboard.writeText(text);
    if (type === 'contract') {
      setCopiedContract(true);
      setTimeout(() => setCopiedContract(false), 2000);
    } else {
      setCopiedCreator(true);
      setTimeout(() => setCopiedCreator(false), 2000);
    }
  };

  // 1. Commit Buyer Demand
  const handleCommitDemand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !walletAddress) {
      setCommitError('Please connect your Stellar wallet first.');
      return;
    }
    setCommitStatus('PENDING');
    setCommitError(null);
    try {
      const res = await SorobanContractService.commitDemand(circle.id, commitQty, walletAddress);
      setCommitTxHash(res.txHash);
      setCommitStatus('SUCCESS');
      await loadDealData();
      onActionSuccess?.();
    } catch (err: any) {
      console.error('Commit error:', err);
      setCommitStatus('ERROR');
      setCommitError(err?.message || 'Failed to escrow commitment.');
    }
  };

  // 2. Submit Seller Offer
  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !walletAddress) {
      setOfferError('Please connect your seller wallet first.');
      return;
    }
    setOfferStatus('PENDING');
    setOfferError(null);
    try {
      const res = await SorobanContractService.submitSellerOffer(
        circle.id,
        offerPriceXlm,
        offerVolume,
        offerLeadDays,
        walletAddress
      );
      setOfferTxHash(res.txHash);
      setOfferStatus('SUCCESS');
      await loadDealData();
      onActionSuccess?.();
    } catch (err: any) {
      console.error('Offer submit error:', err);
      setOfferStatus('ERROR');
      setOfferError(err?.message || 'Failed to submit seller offer.');
    }
  };

  // 3. Accept Offer
  const handleAcceptOffer = async (offerId: number) => {
    if (!isConnected || !walletAddress) {
      alert('Please connect circle creator wallet.');
      return;
    }
    setSettleStatus('PENDING');
    setSettleError(null);
    try {
      const res = await SorobanContractService.acceptSellerOffer(circle.id, offerId, walletAddress);
      setSettleTxHash(res.txHash);
      setSettleStatus('SUCCESS');
      await loadDealData();
      onActionSuccess?.();
    } catch (err: any) {
      setSettleStatus('ERROR');
      setSettleError(err?.message || 'Failed to accept seller offer.');
    }
  };

  // 4. Settle Deal
  const handleSettleDeal = async (offerId: number) => {
    if (!isConnected || !walletAddress) {
      alert('Please connect your wallet.');
      return;
    }
    setSettleStatus('PENDING');
    setSettleError(null);
    try {
      const res = await SorobanContractService.settleDeal(circle.id, offerId, walletAddress);
      setSettleTxHash(res.txHash);
      setSettleStatus('SUCCESS');
      await loadDealData();
      onActionSuccess?.();
    } catch (err: any) {
      setSettleStatus('ERROR');
      setSettleError(err?.message || 'Failed to execute settlement.');
    }
  };

  // 5. Claim Refund
  const handleClaimRefund = async () => {
    if (!isConnected || !walletAddress) {
      alert('Please connect your wallet.');
      return;
    }
    setSettleStatus('PENDING');
    setSettleError(null);
    try {
      const res = await SorobanContractService.claimRefund(circle.id, walletAddress);
      setSettleTxHash(res.txHash);
      setSettleStatus('SUCCESS');
      await loadDealData();
      onActionSuccess?.();
    } catch (err: any) {
      setSettleStatus('ERROR');
      setSettleError(err?.message || 'Failed to claim refund.');
    }
  };

  const targetPriceNum = parseFloat(circle.target_price_xlm);
  const totalCommitCost = (commitQty * targetPriceNum).toFixed(2);
  const currentVolume = deal ? deal.current_volume : 0;
  const maxVolume = deal ? deal.max_volume : circle.target_quantity;
  const minVolume = deal ? deal.min_volume : Math.max(1, Math.round(maxVolume * 0.3));
  const progressPct = Math.min(100, Math.round((currentVolume / maxVolume) * 100));
  const isQuorumReached = currentVolume >= minVolume;
  const totalEscrowXlm = deal ? deal.total_escrow_xlm : '0.00';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '680px',
          width: '100%',
          backgroundColor: '#0c1020',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          position: 'relative',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
          overflowY: 'auto',
          borderRadius: 'var(--radius-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <span className="badge badge-primary">Circle #{circle.id}</span>
              <span
                className={`badge ${
                  deal?.status === 'SETTLED'
                    ? 'badge-success'
                    : isQuorumReached
                    ? 'badge-primary'
                    : circle.status === 'OPEN'
                    ? 'badge-success'
                    : 'badge-demo'
                }`}
              >
                {deal?.status === 'SETTLED' ? 'SETTLED' : isQuorumReached ? 'QUORUM REACHED' : circle.status}
              </span>
              <span className="badge badge-testnet">Soroban Protocol 22</span>
              {isLoadingDeal && <Loader2 size={14} className="animate-spin" style={{ color: 'var(--accent-secondary)' }} />}
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: '#fff' }}>{circle.title}</h2>
          </div>
          <button
            type="button"
            id="btn-close-detail-modal"
            onClick={onClose}
            aria-label="Close detail modal"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0 1.5rem',
            background: 'rgba(0,0,0,0.2)',
            overflowX: 'auto',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            style={{
              padding: '0.75rem 1rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'OVERVIEW' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'OVERVIEW' ? '#fff' : 'var(--text-muted)',
              fontWeight: activeTab === 'OVERVIEW' ? 600 : 400,
              cursor: 'pointer',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
            }}
          >
            Overview & State
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('COMMIT_BUYER')}
            style={{
              padding: '0.75rem 1rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'COMMIT_BUYER' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'COMMIT_BUYER' ? '#fff' : 'var(--text-muted)',
              fontWeight: activeTab === 'COMMIT_BUYER' ? 600 : 400,
              cursor: 'pointer',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
            }}
          >
            Buyer Commitment ({currentVolume}/{maxVolume})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SUBMIT_OFFER')}
            style={{
              padding: '0.75rem 1rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'SUBMIT_OFFER' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'SUBMIT_OFFER' ? '#fff' : 'var(--text-muted)',
              fontWeight: activeTab === 'SUBMIT_OFFER' ? 600 : 400,
              cursor: 'pointer',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
            }}
          >
            Seller Offers ({offers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SETTLEMENT')}
            style={{
              padding: '0.75rem 1rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'SETTLEMENT' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'SETTLEMENT' ? '#fff' : 'var(--text-muted)',
              fontWeight: activeTab === 'SETTLEMENT' ? 600 : 400,
              cursor: 'pointer',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
            }}
          >
            Settlement & Escrow
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <>
              {/* Metrics Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.85rem',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Target Unit Price
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                    {circle.target_price_xlm} XLM
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ceiling price</div>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.85rem',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Committed Demand
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                    {currentVolume} / {maxVolume}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: isQuorumReached ? '#34d399' : 'var(--text-muted)' }}>
                    {isQuorumReached ? 'Quorum satisfied' : `Min ${minVolume} needed`}
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.85rem',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Escrow Custody
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#38bdf8' }}>
                    {totalEscrowXlm} XLM
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Locked in contract</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Demand Pool Progress:</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{progressPct}% ({currentVolume}/{maxVolume} units)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${progressPct}%`,
                      background: 'linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>

              {/* Timings */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Created On-Chain:</span>
                  <span>{circle.createdDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Reservation Deadline:</span>
                  <span style={{ color: circle.isExpired ? '#f87171' : '#34d399', fontWeight: 600 }}>
                    {circle.deadlineDate} {circle.isExpired && '(Expired)'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Metadata URI / IPFS:</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{circle.metadata_uri}</span>
                </div>
              </div>

              {/* On-Chain Addresses */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Creator Address
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(0, 0, 0, 0.3)',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-normal)' }}>
                      {circle.creator}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(circle.creator, 'creator')}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {copiedCreator ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Soroban Deal Engine Contract
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(0, 0, 0, 0.3)',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent-primary-light)' }}>
                      {contractConfig.dealEngine?.contractId || contractConfig.contractId}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(contractConfig.dealEngine?.contractId || contractConfig.contractId, 'contract')}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {copiedContract ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: BUYER COMMITMENT */}
          {activeTab === 'COMMIT_BUYER' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                }}
              >
                Deposit XLM into the Soroban escrow contract to reserve volume. Capital is held under contract custody and only released upon qualified settlement or 100% refunded if the deal does not settle.
              </div>

              <form onSubmit={handleCommitDemand} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                    Units to Reserve (Remaining: {maxVolume - currentVolume} units)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={maxVolume - currentVolume || 1}
                    value={commitQty}
                    onChange={(e) => setCommitQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>

                <div
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.9rem',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>Escrow Deposit Required:</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>
                    {totalCommitCost} XLM
                  </span>
                </div>

                {commitError && (
                  <div style={{ color: '#f87171', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <AlertCircle size={14} /> {commitError}
                  </div>
                )}

                {commitStatus === 'SUCCESS' && commitTxHash && (
                  <div style={{ color: '#34d399', fontSize: '0.8rem', background: 'rgba(52, 211, 153, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <div>Escrow deposit confirmed on Stellar Testnet!</div>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${commitTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#38bdf8', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '0.25rem' }}
                    >
                      View Tx {commitTxHash.slice(0, 10)}... <ExternalLink size={12} />
                    </a>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={commitStatus === 'PENDING' || currentVolume >= maxVolume}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem' }}
                >
                  {commitStatus === 'PENDING' ? 'Escrowing Deposit On-Chain...' : `Commit ${commitQty} Units (${totalCommitCost} XLM)`}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: SELLER OFFERS */}
          {activeTab === 'SUBMIT_OFFER' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Existing Offers Table */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '0.75rem' }}>
                  Competing Seller Quotes ({offers.length})
                </h4>

                {offers.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    No seller quotes submitted yet. Be the first supplier to quote!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {offers.map((off) => {
                      const rep = sellerReputations[off.seller];
                      const unitNum = parseFloat(off.unit_price_xlm);
                      const discountPct = Math.round(((targetPriceNum - unitNum) / targetPriceNum) * 100);

                      return (
                        <div
                          key={off.id}
                          style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: off.status === 'ACCEPTED' ? '1px solid var(--success)' : '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: 'var(--radius-md)',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-secondary)' }}>
                                  {off.unit_price_xlm} XLM/unit
                                </span>
                                {discountPct > 0 && (
                                  <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                                    {discountPct}% discount
                                  </span>
                                )}
                                <span className={`badge ${off.status === 'ACCEPTED' ? 'badge-success' : 'badge-demo'}`}>
                                  {off.status}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                Volume offered: {off.volume} units | Lead time: {off.lead_time_days} days
                              </div>
                            </div>

                            {/* Accept action for creator */}
                            {off.status === 'SUBMITTED' && circle.creator === walletAddress && (
                              <button
                                type="button"
                                onClick={() => handleAcceptOffer(off.id)}
                                className="btn btn-secondary"
                                style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                              >
                                Accept Terms
                              </button>
                            )}
                          </div>

                          {/* Seller Reputation Badge */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: 'rgba(0,0,0,0.25)',
                              padding: '0.4rem 0.6rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                            }}
                          >
                            <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              Seller: {off.seller.slice(0, 8)}...{off.seller.slice(-6)}
                            </span>
                            <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <ShieldCheck size={12} />
                              {rep ? `${rep.scorePercentage}% Rep (${rep.successful_deals} settled)` : 'Verified Seller'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit Seller Quote Form */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '0.75rem' }}>
                  Submit Competing Seller Quote
                </h4>

                <form onSubmit={handleOfferSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        Offered Unit Price (XLM)
                      </label>
                      <input
                        type="text"
                        value={offerPriceXlm}
                        onChange={(e) => setOfferPriceXlm(e.target.value)}
                        className="input-field"
                        style={{ width: '100%', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        Available Volume
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={offerVolume}
                        onChange={(e) => setOfferVolume(parseInt(e.target.value) || 1)}
                        className="input-field"
                        style={{ width: '100%', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        Lead Time (Days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={offerLeadDays}
                        onChange={(e) => setOfferLeadDays(parseInt(e.target.value) || 1)}
                        className="input-field"
                        style={{ width: '100%', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  {offerError && (
                    <div style={{ color: '#f87171', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <AlertCircle size={14} /> {offerError}
                    </div>
                  )}

                  {offerStatus === 'SUCCESS' && offerTxHash && (
                    <div style={{ color: '#34d399', fontSize: '0.8rem', background: 'rgba(52, 211, 153, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                      <div>Seller offer submitted on-chain!</div>
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${offerTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#38bdf8', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        View Tx {offerTxHash.slice(0, 10)}... <ExternalLink size={12} />
                      </a>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={offerStatus === 'PENDING'}
                    className="btn btn-primary"
                    style={{ padding: '0.65rem', fontSize: '0.85rem' }}
                  >
                    {offerStatus === 'PENDING' ? 'Submitting Quote On-Chain...' : 'Broadcast Seller Quote to Deal Engine'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: SETTLEMENT & REFUND */}
          {activeTab === 'SETTLEMENT' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Deal Engine Contract Status:</span>
                  <span style={{ fontWeight: 700, color: '#38bdf8' }}>{deal?.status || circle.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Quorum Condition:</span>
                  <span style={{ fontWeight: 600, color: isQuorumReached ? '#34d399' : '#f87171' }}>
                    {currentVolume} / {minVolume} units ({isQuorumReached ? 'Met' : 'Pending'})
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Escrow Custody Held:</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>{totalEscrowXlm} XLM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Accepted Offer ID:</span>
                  <span>{deal?.accepted_offer_id ? `#${deal.accepted_offer_id}` : 'None'}</span>
                </div>
              </div>

              {settleError && (
                <div style={{ color: '#f87171', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <AlertCircle size={14} /> {settleError}
                </div>
              )}

              {settleStatus === 'SUCCESS' && settleTxHash && (
                <div style={{ color: '#34d399', fontSize: '0.8rem', background: 'rgba(52, 211, 153, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div>Transaction verified and confirmed on Stellar Testnet!</div>
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${settleTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#38bdf8', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    View Tx {settleTxHash.slice(0, 10)}... <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {/* Settlement Button */}
              {isQuorumReached && deal?.status !== 'SETTLED' && offers.some((o) => o.status === 'ACCEPTED') && (
                <button
                  type="button"
                  onClick={() => {
                    const winning = offers.find((o) => o.status === 'ACCEPTED');
                    if (winning) handleSettleDeal(winning.id);
                  }}
                  disabled={settleStatus === 'PENDING'}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem' }}
                >
                  {settleStatus === 'PENDING' ? 'Executing Settlement...' : 'Release Escrow Payout & Settle Deal'}
                </button>
              )}

              {/* Refund Button */}
              {(circle.isExpired || deal?.status === 'CANCELLED') && deal?.status !== 'SETTLED' && (
                <button
                  type="button"
                  onClick={handleClaimRefund}
                  disabled={settleStatus === 'PENDING'}
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '0.75rem' }}
                >
                  {settleStatus === 'PENDING' ? 'Claiming Refund...' : 'Claim 100% Buyer Escrow Refund'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
