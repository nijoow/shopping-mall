'use client';

import Modal from '@/components/Modal';
import Spinner from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { Address, AddressFormInput } from '@/types/types';
import { useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { IoCreateOutline, IoTrashOutline } from 'react-icons/io5';
import { deleteUserAddress, editUserAddress } from '../action';
import AddressFormModal from './AddressFormModal';

type OpenedModal = 'edit' | 'delete' | null;

const EditAddress = ({ address }: { address: Address }) => {
  const [openedModal, setOpenedModal] = useState<OpenedModal>(null);
  const [isLoading, setIsLoading] = useState(false);

  const closeModal = () => setOpenedModal(null);

  const onSubmit: SubmitHandler<AddressFormInput> = async submitData => {
    setIsLoading(true);
    try {
      await editUserAddress({ ...submitData, addressId: address.address_id });
      closeModal();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickDeleteButton = async () => {
    setIsLoading(true);
    try {
      await deleteUserAddress({ addressId: address.address_id });
      closeModal();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="street-card flex min-h-[13rem] w-full flex-col gap-1.5 p-4">
        <span className="text-1.125 font-bold">{address.name}</span>
        <span className="text-0.875 text-muted-foreground">
          {address.phone_number}
        </span>
        <span className="text-0.875 leading-relaxed">
          [{address.post_code}] {address.address}
          {address.detail_address ? `, ${address.detail_address}` : ''}
        </span>
        <div className="flex-auto" />
        <div className="flex gap-5">
          <button
            type="button"
            className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => setOpenedModal('edit')}
          >
            <IoCreateOutline size={18} />
            <span className="text-0.875">수정</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-destructive"
            onClick={() => setOpenedModal('delete')}
          >
            <IoTrashOutline size={18} />
            <span className="text-0.875">삭제</span>
          </button>
        </div>
      </div>

      {openedModal === 'edit' && (
        <AddressFormModal
          title="배송지 수정"
          defaultValues={{
            name: address.name,
            phoneNumber: address.phone_number,
            postCode: address.post_code,
            address: address.address,
            detailAddress: address.detail_address,
          }}
          isLoading={isLoading}
          onSubmit={onSubmit}
          onClose={closeModal}
        />
      )}

      {openedModal === 'delete' && (
        <Modal>
          <Modal.Title closeModal={closeModal}>배송지 삭제</Modal.Title>
          <Modal.Body>배송지 정보를 정말 삭제하시겠습니까?</Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3">
              <Button
                variant="street-outline"
                disabled={isLoading}
                onClick={closeModal}
              >
                취소
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="rounded-none"
                disabled={isLoading}
                onClick={handleClickDeleteButton}
              >
                {isLoading ? <Spinner fill="white" width={20} /> : '삭제'}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default EditAddress;
