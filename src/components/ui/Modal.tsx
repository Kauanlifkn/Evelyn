'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      // showModal gives native focus trapping + Escape handling. jsdom does
      // not implement it, so tests fall back to the open attribute.
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
    } else if (!open && dialog.open) {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handler = () => {
      if (!dialog.open) onClose();
    };
    dialog.addEventListener('close', handler);
    return () => dialog.removeEventListener('close', handler);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        'w-full max-w-lg rounded-2xl border-0 bg-hydro-surface p-0 shadow-hydro-lg backdrop:bg-black/50',
        className
      )}
      aria-labelledby="modal-title"
    >
      <div className="flex items-center justify-between border-b border-hydro-border px-6 py-4">
        <h2 id="modal-title" className="text-lg font-semibold text-hydro-text">
          {title}
        </h2>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-hydro-text-secondary hover:bg-hydro-surface-blue hover:text-hydro-text transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
    </dialog>
  );
}
