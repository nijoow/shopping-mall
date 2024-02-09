'use client';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import React, { useState } from 'react';
import { IoAdd } from 'react-icons/io5';
import { z } from 'zod';
import { phoneRegex } from '@/lib/utils/regex';
import { useDaumPostcodePopup } from 'react-daum-postcode';
import { SubmitHandler, useForm } from 'react-hook-form';
import { formatPhoneNumber } from '@/lib/utils/formatPhoneNumber';
import { User } from 'next-auth';
import Spinner from '@/components/Spinner';
import { AddressFormInput } from '@/types/types';

const AddAddress = ({ user }: { user: User }) => {
  const open = useDaumPostcodePopup();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddressFormInput>({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
      const response = await fetch('/api/user/address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.user_id,
          name: submitData.name,
          phoneNumber: submitData.phoneNumber,
          postCode: submitData.postCode,
          address: submitData.address,
          detailAddress: submitData.detailAddress,
        }),
      });
      if (response.ok) {
        closeModal();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="cursor-pointer gap-2 bg-white flex flex-col col-span-1 rounded-lg p-4 w-full h-52 border border-gray-300"
        onClick={openModal}
      >
        <span className="text-1.125 font-semibold">새 배송지</span>
        <div className="flex-auto" />
        <div className="flex items-center gap-1.5">
          <IoAdd size={20} /> <span className="text-0.875">추가</span>
        </div>
      </div>

      {isModalOpen && (
        <Modal>
          <Modal.Title closeModal={closeModal}>배송지 추가</Modal.Title>
          <Modal.Body>
            <form
              id="address-form"
              className="flex flex-col gap-4 w-full my-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              <label className="flex flex-col gap-1 w-full">
                <div className="w-full flex flex-col gap-0.5">
                  <span>이름</span>
                  <input
                    placeholder="이름을 입력해주세요"
                    {...register('name', {
                      required: '이름은 필수입니다!',
                    })}
                    className="px-3 py-2.5 rounded-md text-1 border border-gray-300 flex-auto"
                  />
                  {errors.name && (
                    <span className="text-0.875 text-red-400">
                      {errors.name.message}
                    </span>
                  )}
                </div>
              </label>
              <label className="flex flex-col gap-1 w-full">
                <div className="w-full flex flex-col gap-0.5">
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
                    className="px-3 py-2.5 rounded-md text-1 border border-gray-300 flex-auto"
                  />
                  {errors.phoneNumber && (
                    <span className="text-0.875 text-red-400">
                      {errors.phoneNumber.message}
                    </span>
                  )}
                </div>
              </label>
              <label className="flex flex-col gap-1 w-full">
                <span>주소</span>
                <div className="w-full flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="우편번호"
                    disabled
                    {...register('postCode', {
                      required: '주소찾기 버튼을 통해 주소를 입력해주세요!',
                    })}
                    value={watch('postCode')}
                    className="px-3 py-2.5 rounded-md text-1 border border-gray-300 flex-auto"
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
                  className="px-3 py-2.5 rounded-md text-1 border border-gray-300 flex-auto"
                />
                <input
                  type="text"
                  placeholder="상세 주소"
                  {...register('detailAddress')}
                  onChange={e => setValue('detailAddress', e.target.value)}
                  className="px-3 py-2.5 rounded-md text-1 border border-gray-300 flex-auto"
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
            <div className="flex gap-3 mt-6">
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
    </>
  );
};

export default AddAddress;
