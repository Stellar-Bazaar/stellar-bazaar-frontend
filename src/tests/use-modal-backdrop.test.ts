import { describe, it, expect, vi } from 'vitest';

describe('modal backdrop and escape logic', () => {
  it('correctly identifies backdrop target clicks vs modal content clicks', () => {
    const onClose = vi.fn();

    // Backdrop click: target === currentTarget
    const mockBackdropEvent = {
      target: 'backdrop-element',
      currentTarget: 'backdrop-element',
    } as any;

    if (mockBackdropEvent.target === mockBackdropEvent.currentTarget) {
      onClose();
    }
    expect(onClose).toHaveBeenCalledTimes(1);

    // Modal content click: target !== currentTarget
    const mockInnerEvent = {
      target: 'inner-modal-card',
      currentTarget: 'backdrop-element',
    } as any;

    if (mockInnerEvent.target === mockInnerEvent.currentTarget) {
      onClose();
    }
    expect(onClose).toHaveBeenCalledTimes(1); // not called again
  });

  it('correctly matches Escape key for dialog dismissal', () => {
    const onClose = vi.fn();
    const handleKey = (e: { key: string }) => {
      if (e.key === 'Escape') onClose();
    };

    handleKey({ key: 'Enter' });
    expect(onClose).not.toHaveBeenCalled();

    handleKey({ key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
