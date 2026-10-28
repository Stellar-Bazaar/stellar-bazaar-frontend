/**
 * Utility helper to standardize status badge colors, labels, and styles across Stellar Bazaar
 */

export interface StatusBadgeConfig {
  label: string;
  className: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export function getStatusBadgeConfig(status: string): StatusBadgeConfig {
  const normalized = (status || '').toUpperCase();
  switch (normalized) {
    case 'OPEN':
      return {
        label: 'Open',
        className: 'badge-success',
        bgColor: 'rgba(16, 185, 129, 0.15)',
        textColor: '#34d399',
        borderColor: 'rgba(16, 185, 129, 0.3)',
      };
    case 'QUORUM_REACHED':
    case 'QUORUM':
      return {
        label: 'Quorum Reached',
        className: 'badge-primary',
        bgColor: 'rgba(99, 102, 241, 0.15)',
        textColor: '#818cf8',
        borderColor: 'rgba(99, 102, 241, 0.3)',
      };
    case 'SETTLED':
      return {
        label: 'Settled',
        className: 'badge-testnet',
        bgColor: 'rgba(14, 165, 233, 0.15)',
        textColor: '#38bdf8',
        borderColor: 'rgba(14, 165, 233, 0.3)',
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        className: 'badge-demo',
        bgColor: 'rgba(239, 68, 68, 0.15)',
        textColor: '#f87171',
        borderColor: 'rgba(239, 68, 68, 0.3)',
      };
    case 'EXPIRED':
      return {
        label: 'Expired',
        className: 'badge-demo',
        bgColor: 'rgba(245, 158, 11, 0.15)',
        textColor: '#fbbf24',
        borderColor: 'rgba(245, 158, 11, 0.3)',
      };
    case 'CLOSED':
      return {
        label: 'Closed',
        className: 'badge-secondary',
        bgColor: 'rgba(148, 163, 184, 0.15)',
        textColor: '#cbd5e1',
        borderColor: 'rgba(148, 163, 184, 0.3)',
      };
    default:
      return {
        label: status,
        className: 'badge-secondary',
        bgColor: 'rgba(148, 163, 184, 0.15)',
        textColor: '#cbd5e1',
        borderColor: 'rgba(148, 163, 184, 0.3)',
      };
  }
}
