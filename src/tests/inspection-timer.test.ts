import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import {
  InspectionTimer,
  formatRemainingTime,
} from '../components/InspectionTimer';

describe('InspectionTimer & formatRemainingTime', () => {
  describe('formatRemainingTime', () => {
    it('returns expired state for 0 or negative seconds', () => {
      expect(formatRemainingTime(0)).toBe('Inspection Expired (Settlement Ready)');
      expect(formatRemainingTime(-10)).toBe('Inspection Expired (Settlement Ready)');
    });

    it('formats minutes and seconds', () => {
      expect(formatRemainingTime(125)).toBe('2m 5s');
      expect(formatRemainingTime(59)).toBe('0m 59s');
    });

    it('formats hours, minutes, and seconds', () => {
      // 3665s = 1h 1m 5s
      expect(formatRemainingTime(3665)).toBe('1h 1m 5s');
    });

    it('formats days, hours, minutes, and seconds', () => {
      // 90065s = 1d 1h 1m 5s
      expect(formatRemainingTime(90065)).toBe('1d 1h 1m 5s');
    });
  });

  describe('InspectionTimer component', () => {
    it('is exported and defined as a React component', () => {
      expect(InspectionTimer).toBeDefined();
      expect(typeof InspectionTimer).toBe('function');
    });

    it('instantiates cleanly with future timestamp', () => {
      const handleEarlyConfirm = vi.fn();
      const handleDispute = vi.fn();
      const futureTime = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now

      const element = React.createElement(InspectionTimer, {
        inspectionEndTimestamp: futureTime,
        onConfirmEarly: handleEarlyConfirm,
        onRaiseDispute: handleDispute,
        isConfirming: false,
      });

      expect(element.props.inspectionEndTimestamp).toBe(futureTime);
      expect(element.props.onConfirmEarly).toBe(handleEarlyConfirm);
      expect(element.props.onRaiseDispute).toBe(handleDispute);
    });
  });
});
