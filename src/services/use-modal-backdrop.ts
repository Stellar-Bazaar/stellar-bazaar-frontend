import { useEffect, useCallback } from 'react';

interface UseModalBackdropOptions {
  isOpen: boolean;
  onClose: () => void;
  closeOnEscape?: boolean;
}

/**
 * Reusable hook managing modal backdrop click dismissal, Escape key detection,
 * and background body scroll locking for accessible dialogs.
 */
export function useModalBackdrop({
  isOpen,
  onClose,
  closeOnEscape = true,
}: UseModalBackdropOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, handleKeyDown]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  return { handleBackdropClick };
}
