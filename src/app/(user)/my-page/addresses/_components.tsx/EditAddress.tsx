'use client';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import React, { useEffect, useMemo, useState } from 'react';
import { IoTrashOutline, IoCreateOutline } from 'react-icons/io5';
import { phoneRegex } from '@/lib/utils/regex';
import { useDaumPostcodePopup } from 'react-daum-postcode';
import { SubmitHandler, useForm } from 'react-hook-form';
import { formatPhoneNumber } from '@/lib/utils/formatPhoneNumber';
import Spinner from '@/components/Spinner';
import { Address, AddressFormInput } from '@/types/types';
import { deleteUserAddress, editUserAddress } from '../action';

const EditAddress = ({ address }: { address: Address }) => {
  const open = useDaumPostcodePopup();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddressFormInput>({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [isModalOpen, setIsModalOpen] = useState({
    edit: false,
    delete: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    reset({
      name: address.name,
      phoneNumber: address.phone_number,
      postCode: address.post_code,
      address: address.address,
      detailAddress: address.detail_address,
    });
  }, [address]);

  const openEditModal = () => {
    setIsModalOpen({ ...isModalOpen, edit: true });
  };
  const openDeleteModal = () =>
    setIsModalOpen({ ...isModalOpen, delete: true });
  const closeModal = () => {
    reset();
    setIsModalOpen({ edit: false, delete: false });
  };

  const onChangePhoneNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length > 13) return;
    setValue('phoneNumber', formatPhoneNumber(event.target.value));
  };

  const handleComplete = (data: any) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress +=
          extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
    }

    setValue('postCode', data.zonecode);
    setValue('address', fullAddress);
  };

  const onSubmit: SubmitHandler<AddressFormInput> = async submitData => {
    setIsLoading(true);
    try {
      await editUserAddress({ ...submitData, addressId: address.address_id });
      closeModal();
    } catch (error) {
      console.log(error);
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
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="col-span-1 flex h-52 w-full flex-col gap-2 rounded-lg border border-gray-300 bg-white p-4">
        <span className="text-1.125 font-medium">{address.name}</span>
        <span className="text-0.875 text-gray-500">{address.phone_number}</span>
        <span className="text-0.875">
          [{address.post_code}] {address.address}
          {address.detail_address ? `, ${address.detail_address}` : ''}
        </span>
        <div className="flex-auto" />
        <div className="flex gap-6">
          <button
            type="button"
            className="flex items-center gap-1.5"
            onClick={openEditModal}
          >
            <IoCreateOutline size={20} />
            <span className="text-0.875">수정</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5"
            onClick={openDeleteModal}
          >
            <IoTrashOutline size={20} />
            <span className="text-0.875">삭제</span>
          </button>
        </div>
      </div>
      {isModalOpen.edit && (
        <Modal>
          <Modal.Title closeModal={closeModal}>배송지 수정</Modal.Title>
          <Modal.Body>
            <form
              id="address-form"
              className="flex w-full flex-col gap-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              <label className="flex w-full flex-col gap-1">
                <div className="flex w-full flex-col gap-0.5">
                  <span>이름</span>
                  <input
                    placeholder="이름을 입력해주세요"
                    {...register('name', {
                      required: '이름은 필수입니다!',
                    })}
                    className="flex-auto rounded-md border border-gray-300 px-3 py-2.5 text-1"
                  />
                  {errors.name && (
                    <span className="text-0.875 text-red-400">
                      {errors.name.message}
                    </span>
                  )}
                </div>
              </label>
              <label className="flex w-full flex-col gap-1">
                <div className="flex w-full flex-col gap-0.5">
                  <span>휴대폰 번호</span>
                  <input
                    placeholder="휴대폰 번호를 입력해주세요"
                    {...register('phoneNumber', {
                      required: '휴대폰 번호는 필수입니다!',
                      pattern: {
                        value: phoneRegex,
                        message: '휴대폰 번호를 올바르게 입력해주세요!',
                      },
                    })}
                    onChange={onChangePhoneNumber}
                    value={watch('phoneNumber')}
                    className="flex-auto rounded-md border border-gray-300 px-3 py-2.5 text-1"
                  />
                  {errors.phoneNumber && (
                    <span className="text-0.875 text-red-400">
                      {errors.phoneNumber.message}
                    </span>
                  )}
                </div>
              </label>
              <label className="flex w-full flex-col gap-1">
                <span>주소</span>
                <div className="flex w-full items-center gap-1">
                  <input
                    type="text"
                    placeholder="우편번호"
                    disabled
                    {...register('postCode', {
                      required: '주소찾기 버튼을 통해 주소를 입력해주세요!',
                    })}
                    value={watch('postCode')}
                    className="flex-auto rounded-md border border-gray-300 px-3 py-2.5 text-1"
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      open({
                        width: 400,
                        height: 600,
                        onComplete: handleComplete,
                      })
                    }
                  >
                    주소찾기
                  </Button>
                </div>
                <input
                  type="text"
                  placeholder="기본 주소"
                  disabled
                  {...register('address', {
                    required: '주소찾기 버튼을 통해 주소를 입력해주세요!',
                  })}
                  value={watch('address')}
                  className="flex-auto rounded-md border border-gray-300 px-3 py-2.5 text-1"
                />
                <input
                  key={`${address.address_id}-detail_address-${address.detail_address}`}
                  type="text"
                  placeholder="상세 주소"
                  {...register('detailAddress')}
                  onChange={e => setValue('detailAddress', e.target.value)}
                  className="flex-auto rounded-md border border-gray-300 px-3 py-2.5 text-1"
                />
                {errors.address && (
                  <span className="text-0.875 text-red-400">
                    {errors.address.message}
                  </span>
                )}
              </label>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3">
              <Button variant="outlined" onClick={closeModal}>
                취소
              </Button>
              <Button type="submit" form="address-form" disabled={isLoading}>
                {isLoading ? <Spinner fill="white" width={20} /> : '저장'}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}
      {isModalOpen.delete && (
        <Modal>
          <Modal.Title closeModal={closeModal}>배송지 삭제</Modal.Title>
          <Modal.Body>배송지 정보를 정말 삭제하시겠습니까? </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3">
              <Button variant="outlined" onClick={closeModal}>
                취소
              </Button>
              <Button
                type="button"
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
