import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import {
  PaymentFormValues,
  PaymentStatus,
  PaymentValidationErrors,
  TransactionConfirmation,
} from '../types/payment';
import { validatePaymentForm, STELLAR_BASE_RESERVE_XLM } from '../services/validation';
import { EXPLORER_BASE_URL } from '../services/stellar-horizon';

interface PaymentFormProps {
  sourceAddress: string | null;
  currentBalanceXlm: number;
  paymentStatus: PaymentStatus;
  statusMessage?: string;
  confirmation: TransactionConfirmation | null;
  errorMessage: string | null;
  onSubmitPayment: (values: PaymentFormValues) => Promise<void>;
  onResetConfirmation: () => void;
}

// Sample official testnet address for quick testing if needed
const SAMPLE_TESTNET_DESTINATION = 'GAFAVMHP54H3DRZU7RJPOIV5N7KEYC5F7XFKX3YXMYYZB2VBZBJG5PJZ';

export const PaymentForm: React.FC<PaymentFormProps> = ({
  sourceAddress,
  currentBalanceXlm,
  paymentStatus,
  statusMessage,
  confirmation,
  errorMessage,
  onSubmitPayment,
  onResetConfirmation,
}) => {
  const [values, setValues] = useState<PaymentFormValues>({
    destinationAddress: '',
    amount: '1',
    memo: 'Stellar Bazaar Order',
  });
  const [errors, setErrors] = useState<PaymentValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isProcessing =
    paymentStatus === 'VALIDATING' ||
    paymentStatus === 'BUILDING_TRANSACTION' ||
    paymentStatus === 'AWAITING_WALLET_SIGNATURE' ||
    paymentStatus === 'SUBMITTING_TO_TESTNET';

  const maxSendable = Math.max(0, currentBalanceXlm - STELLAR_BASE_RESERVE_XLM - 0.00001);

  const handleInputChange = (field: keyof PaymentFormValues, value: string) => {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);

    if (touched[field]) {
      const { errors: validationErrors } = validatePaymentForm(
        nextValues,
        sourceAddress,
        currentBalanceXlm
      );
      setErrors(validationErrors);
    }
  };

  const handleBlur = (field: keyof PaymentFormValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const { errors: validationErrors } = validatePaymentForm(
      values,
      sourceAddress,
      currentBalanceXlm
    );
    setErrors(validationErrors);
  };

  const handlePresetAmount = (preset: number) => {
    handleInputChange('amount', preset.toString());
  };

  const handleMaxAmount = () => {
    if (maxSendable > 0) {
      handleInputChange('amount', maxSendable.toFixed(4));
    }
  };

  const handleFillSample = () => {
    handleInputChange('destinationAddress', SAMPLE_TESTNET_DESTINATION);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    setTouched({ destinationAddress: true, amount: true, memo: true });
    const { isValid, errors: validationErrors } = validatePaymentForm(
      values,
      sourceAddress,
      currentBalanceXlm
    );
    setErrors(validationErrors);

    if (!isValid) return;

    await onSubmitPayment(values);
  };

  return (
    <div className="glass-card" id="payment-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Send size={20} color="var(--accent-primary-light)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Stellar Testnet Payment</h2>
        </div>
        <span className="badge badge-testnet">XLM Native</span>
      </div>
      <p className="section-subtitle">
        Execute verified payments on Stellar Testnet to fund demand circles or test ledger settlements.
      </p>

      {/* Confirmation View */}
      {confirmation && (
        <div
          id="tx-confirmation-panel"
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
            <CheckCircle2 size={24} color="#34d399" />
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#34d399' }}>Transaction Confirmed!</h3>
              <p style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>
                Included in Stellar Testnet Ledger #{confirmation.ledger}
              </p>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1rem',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              wordBreak: 'break-all',
            }}
          >
            <div style={{ marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
              Transaction Hash:
            </div>
            <div id="confirmed-tx-hash" style={{ color: '#ffffff', fontWeight: 600 }}>
              {confirmation.hash}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a
              id="btn-view-explorer"
              href={`${EXPLORER_BASE_URL}/tx/${confirmation.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              <span>View in Stellar Explorer</span>
              <ExternalLink size={14} />
            </a>
            <button
              type="button"
              id="btn-new-payment"
              onClick={onResetConfirmation}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              Send Another Payment
            </button>
          </div>
        </div>
      )}

      {/* Error View */}
      {errorMessage && !isProcessing && (
        <div
          id="tx-error-panel"
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            gap: '0.65rem',
            alignItems: 'flex-start',
          }}
        >
          <AlertCircle size={20} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <span style={{ fontWeight: 600, color: '#fca5a5', fontSize: '0.9rem' }}>
              Transaction Failed
            </span>
            <p id="tx-error-message" style={{ color: '#f87171', fontSize: '0.825rem', marginTop: '0.2rem' }}>
              {errorMessage}
            </p>
          </div>
        </div>
      )}

      {/* Active Processing Indicator */}
      {isProcessing && (
        <div
          id="tx-pending-panel"
          style={{
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
          }}
        >
          <div className="spinner" style={{ width: '24px', height: '24px' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#c7d2fe' }}>
              {paymentStatus === 'BUILDING_TRANSACTION' && 'Constructing Stellar Transaction...'}
              {paymentStatus === 'AWAITING_WALLET_SIGNATURE' && 'Please Approve in Freighter Wallet...'}
              {paymentStatus === 'SUBMITTING_TO_TESTNET' && 'Broadcasting to Stellar Testnet Ledger...'}
              {paymentStatus === 'VALIDATING' && 'Validating parameters...'}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#a5b4fc' }}>
              {statusMessage || 'Do not close or reload this window.'}
            </p>
          </div>
        </div>
      )}

      {/* Main Payment Form */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Recipient Address */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label htmlFor="destination-address-input" className="form-label" style={{ marginBottom: 0 }}>
              Recipient Stellar Public Address (G...)
            </label>
            <button
              type="button"
              id="btn-fill-sample-dest"
              onClick={handleFillSample}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-primary-light)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Fill Sample Destination
            </button>
          </div>
          <input
            id="destination-address-input"
            type="text"
            className={`form-input ${errors.destinationAddress && touched.destinationAddress ? 'is-invalid' : ''}`}
            placeholder="e.g. GDJRVXZ26XGY7YHYEQ6XGOGEUBV5R6E2XWZK2R2Z3P6L4O4XQ6B3Z7KL"
            value={values.destinationAddress}
            onChange={(e) => handleInputChange('destinationAddress', e.target.value)}
            onBlur={() => handleBlur('destinationAddress')}
            disabled={isProcessing}
            spellCheck={false}
          />
          {errors.destinationAddress && touched.destinationAddress && (
            <div className="form-error-text" id="destination-error-text">
              <AlertCircle size={14} />
              <span>{errors.destinationAddress}</span>
            </div>
          )}
        </div>

        {/* XLM Amount */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label htmlFor="amount-input" className="form-label" style={{ marginBottom: 0 }}>
              Payment Amount (XLM)
            </label>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Spendable: <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{maxSendable.toFixed(4)} XLM</span>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              id="amount-input"
              type="text"
              inputMode="decimal"
              className={`form-input ${errors.amount && touched.amount ? 'is-invalid' : ''}`}
              placeholder="0.00"
              value={values.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              onBlur={() => handleBlur('amount')}
              disabled={isProcessing}
              style={{ paddingRight: '4.5rem' }}
            />
            <span
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              XLM
            </span>
          </div>

          {/* Quick presets */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.65rem' }}>
            {[1, 5, 10].map((preset) => (
              <button
                key={preset}
                type="button"
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                onClick={() => handlePresetAmount(preset)}
                disabled={isProcessing}
              >
                {preset} XLM
              </button>
            ))}
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', color: 'var(--accent-primary-light)' }}
              onClick={handleMaxAmount}
              disabled={isProcessing || maxSendable <= 0}
            >
              Max
            </button>
          </div>

          {errors.amount && touched.amount && (
            <div className="form-error-text" id="amount-error-text">
              <AlertCircle size={14} />
              <span>{errors.amount}</span>
            </div>
          )}
        </div>

        {/* Optional Memo */}
        <div className="form-group">
          <label htmlFor="memo-input" className="form-label">
            Transaction Memo (Optional, max 28 bytes)
          </label>
          <input
            id="memo-input"
            type="text"
            className={`form-input ${errors.memo && touched.memo ? 'is-invalid' : ''}`}
            placeholder="e.g. Demand pool #42 order deposit"
            value={values.memo}
            onChange={(e) => handleInputChange('memo', e.target.value)}
            onBlur={() => handleBlur('memo')}
            disabled={isProcessing}
            maxLength={28}
          />
          {errors.memo && touched.memo && (
            <div className="form-error-text">
              <AlertCircle size={14} />
              <span>{errors.memo}</span>
            </div>
          )}
        </div>

        {/* Network & Fees Summary */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem',
            marginBottom: '1.5rem',
            fontSize: '0.8rem',
            color: 'var(--text-dim)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span>Network Base Fee</span>
            <span style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>0.00001 XLM</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span>Required Base Reserve</span>
            <span style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>1.00000 XLM</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Network</span>
            <span style={{ color: 'var(--accent-warning)', fontWeight: 600 }}>Stellar Testnet</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="btn-submit-payment"
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.9rem' }}
          disabled={isProcessing || !sourceAddress}
        >
          {isProcessing ? (
            <>
              <span className="spinner" />
              <span>Broadcasting Payment...</span>
            </>
          ) : !sourceAddress ? (
            <span>Connect Wallet to Pay</span>
          ) : (
            <>
              <Send size={18} />
              <span>Sign & Submit Testnet Payment</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
