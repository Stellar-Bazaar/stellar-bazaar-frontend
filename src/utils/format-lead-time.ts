/**
 * Utility converting Stellar ledger block counts (~5s per block) into human-readable delivery durations.
 */

export const STELLAR_LEDGER_SECONDS = 5;

export interface FormatLeadTimeOptions {
  includeLedgerCount?: boolean;
}

export function formatLeadTime(
  leadTimeLedgers: number,
  options: FormatLeadTimeOptions = {}
): string {
  if (!leadTimeLedgers || leadTimeLedgers <= 0) {
    return 'Immediate (0 ledgers)';
  }

  const totalSeconds = leadTimeLedgers * STELLAR_LEDGER_SECONDS;
  const minutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let readable = '';

  if (days > 0) {
    const remainingHours = hours % 24;
    if (remainingHours > 0) {
      readable = `${days} day${days > 1 ? 's' : ''} ${remainingHours} hr${remainingHours > 1 ? 's' : ''}`;
    } else {
      readable = `${days} day${days > 1 ? 's' : ''}`;
    }
  } else if (hours > 0) {
    const remainingMinutes = minutes % 60;
    if (remainingMinutes > 0) {
      readable = `${hours} hr${hours > 1 ? 's' : ''} ${remainingMinutes} min${remainingMinutes > 1 ? 's' : ''}`;
    } else {
      readable = `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  } else if (minutes > 0) {
    readable = `${minutes} min${minutes > 1 ? 's' : ''}`;
  } else {
    readable = `${totalSeconds} sec`;
  }

  if (options.includeLedgerCount) {
    const formattedLedgers = leadTimeLedgers.toLocaleString();
    return `${readable} (~${formattedLedgers} ledgers)`;
  }

  return readable;
}
