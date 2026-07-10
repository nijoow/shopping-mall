import React from 'react';
import { IoClose } from 'react-icons/io5';

const Modal = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
    <div
      role="dialog"
      aria-modal="true"
      className="m-auto flex max-h-[90dvh] w-full max-w-md flex-col gap-4 overflow-y-auto border border-border bg-card p-5 text-card-foreground shadow-street"
    >
      {children}
    </div>
  </div>
);

const Title = ({
  children,
  closeModal,
}: {
  children: React.ReactNode;
  closeModal: () => void;
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 text-1.25 font-bold">
      <span aria-hidden className="inline-block h-2.5 w-2.5 bg-volt" />
      {children}
    </div>
    <button
      type="button"
      onClick={closeModal}
      aria-label="close"
      className="transition-transform hover:rotate-90"
    >
      <IoClose size={24} />
    </button>
  </div>
);

const Description: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex h-full items-center justify-center pb-4 pt-2 text-0.875 text-muted-foreground">
    {children}
  </div>
);

const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);

const Footer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center justify-end gap-x-4">{children}</div>
);

Modal.Title = Title;
Modal.Description = Description;
Modal.Body = Body;
Modal.Footer = Footer;

export default Modal;
