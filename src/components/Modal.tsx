import React from 'react';
import { IoClose } from 'react-icons/io5';

const Modal = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="fixed left-0 top-0 flex h-screen w-screen items-center justify-center bg-black/30">
      <div className="m-auto flex w-full max-w-md flex-col gap-4 rounded-lg bg-white p-4 shadow-md">
        {children}
      </div>
    </div>
  );
};

const Title = ({
  children,
  closeModal,
}: {
  children: React.ReactNode;
  closeModal: () => void;
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="text-1.375 font-semibold">{children}</div>
      <div>
        <button onClick={closeModal}>
          <IoClose size={24} />
        </button>
      </div>
    </div>
  );
};

const Description: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="text-small-regular text-ui-fg-base flex h-full items-center justify-center pb-4 pt-2">
      {children}
    </div>
  );
};

const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
};

const Footer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex items-center justify-end gap-x-4">{children}</div>
  );
};

Modal.Title = Title;
Modal.Description = Description;
Modal.Body = Body;
Modal.Footer = Footer;

export default Modal;
