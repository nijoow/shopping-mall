import React from 'react';
import { IoClose } from 'react-icons/io5';

const Modal = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="left-0 top-0 flex items-center justify-center fixed w-screen h-screen bg-black/30">
      <div className="w-full max-w-md rounded-lg p-4 shadow-md bg-white m-auto">
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
      <div className="text-1.25 font-semibold">{children}</div>
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
    <div className="flex text-small-regular text-ui-fg-base items-center justify-center pt-2 pb-4 h-full">
      {children}
    </div>
  );
};

const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="flex justify-center">{children}</div>;
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
