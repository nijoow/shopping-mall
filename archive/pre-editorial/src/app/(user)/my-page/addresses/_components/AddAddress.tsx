'use client';

import { AddressFormInput } from '@/types/types';
import { useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { IoAdd } from 'react-icons/io5';
import { addUserAddress } from '../action';
import AddressFormModal from './AddressFormModal';

const AddAddress = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<AddressFormInput> = async submitData => {
    setIsLoading(true);
    try {
      await addUserAddress(submitData);
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="street-card street-card-hover flex min-h-[13rem] w-full flex-col items-center justify-center gap-2 border-dashed p-4 text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => setIsModalOpen(true)}
      >
        <span className="flex h-10 w-10 items-center justify-center bg-volt text-ink">
          <IoAdd size={24} />
        </span>
        <span className="display text-0.875 tracking-widest">NEW ADDRESS</span>
        <span className="text-0.75">새 배송지를 추가해보세요</span>
      </button>

      {isModalOpen && (
        <AddressFormModal
          title="배송지 추가"
          isLoading={isLoading}
          onSubmit={onSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default AddAddress;
