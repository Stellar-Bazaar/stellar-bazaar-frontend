import { describe, it, expect } from 'vitest';
import { formatLeadTime, STELLAR_LEDGER_SECONDS } from '../utils/format-lead-time';

describe('formatLeadTime', () => {
  it('handles zero or negative ledger count', () => {
    expect(formatLeadTime(0)).toBe('Immediate (0 ledgers)');
    expect(formatLeadTime(-5)).toBe('Immediate (0 ledgers)');
  });

  it('formats lead time in seconds for small ledger counts', () => {
    // 2 ledgers = 10s
    expect(formatLeadTime(2)).toBe('10 sec');
    // 6 ledgers = 30s
    expect(formatLeadTime(6)).toBe('30 sec');
  });

  it('formats lead time in minutes', () => {
    // 12 ledgers = 60s = 1 min
    expect(formatLeadTime(12)).toBe('1 min');
    // 60 ledgers = 300s = 5 mins
    expect(formatLeadTime(60)).toBe('5 mins');
  });

  it('formats lead time in hours and remaining minutes', () => {
    // 720 ledgers = 3600s = 1 hour
    expect(formatLeadTime(720)).toBe('1 hour');
    // 750 ledgers = 3750s = 1 hr 2 mins
    expect(formatLeadTime(750)).toBe('1 hr 2 mins');
    // 1440 ledgers = 7200s = 2 hours
    expect(formatLeadTime(1440)).toBe('2 hours');
  });

  it('formats lead time in days and remaining hours', () => {
    // 17280 ledgers = 86400s = 1 day
    expect(formatLeadTime(17280)).toBe('1 day');
    // 18000 ledgers = 90000s = 1 day 1 hr
    expect(formatLeadTime(18000)).toBe('1 day 1 hr');
    // 34560 ledgers = 2 days
    expect(formatLeadTime(34560)).toBe('2 days');
  });

  it('appends ledger count suffix when requested', () => {
    expect(formatLeadTime(17280, { includeLedgerCount: true })).toBe('1 day (~17,280 ledgers)');
    expect(formatLeadTime(60, { includeLedgerCount: true })).toBe('5 mins (~60 ledgers)');
  });

  it('exports correct ledger interval constant', () => {
    expect(STELLAR_LEDGER_SECONDS).toBe(5);
  });
});

