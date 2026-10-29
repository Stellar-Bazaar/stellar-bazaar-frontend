import React from 'react';
import { useModalBackdrop } from '../services/use-modal-backdrop';

export interface SlideOverDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const SlideOverDrawer: React.FC<SlideOverDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  className = '',
}) => {
  const { handleBackdropClick } = useModalBackdrop({ isOpen, onClose });

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={handleBackdropClick}
      data-testid="drawer-backdrop"
    >
      <div
        className={`w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-in-out ${className}`}
        onClick={(e) => e.stopPropagation()}
        data-testid="drawer-panel"
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 id="drawer-title" className="text-base font-bold text-slate-100">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {children}
        </div>

        {/* Optional Sticky Footer */}
        {footer && (
          <div className="p-6 border-t border-slate-800 bg-slate-900/80 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

