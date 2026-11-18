'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { useRef } from 'react';

export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  action,
  pending = false,
  error,
  retryDelay = 0,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  action: string;
  pending?: boolean;
  error?: string;
  retryDelay?: number;
  onConfirm: () => void;
}) {
  const cancel = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root
      open={open}
      onOpenChange={value => {
        if (!value && !pending) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="confirm-dialog"
          role="alertdialog"
          aria-busy={pending}
          onOpenAutoFocus={event => {
            event.preventDefault();
            opener.current = document.activeElement as HTMLElement | null;
            cancel.current?.focus();
          }}
          onCloseAutoFocus={event => {
            event.preventDefault();
            const target = opener.current?.isConnected
              ? opener.current
              : document.querySelector<HTMLElement>('[data-confirm-fallback]');
            target?.focus();
          }}
          onEscapeKeyDown={event => {
            if (pending) event.preventDefault();
          }}
          onPointerDownOutside={event => {
            if (pending) event.preventDefault();
          }}
        >
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description>{description}</Dialog.Description>
          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}
          <div className="confirm-actions">
            <button
              ref={cancel}
              className="button outline"
              disabled={pending}
              onClick={onClose}
            >
              취소
            </button>
            <button
              className="button danger"
              disabled={pending || retryDelay > 0}
              onClick={onConfirm}
            >
              {pending
                ? '처리 중…'
                : retryDelay
                  ? `${retryDelay}초 후 다시 시도`
                  : action}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
