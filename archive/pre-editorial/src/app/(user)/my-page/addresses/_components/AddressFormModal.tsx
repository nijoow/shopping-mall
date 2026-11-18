'use client';

import Modal from '@/components/Modal';
import Spinner from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { AddressFormInput } from '@/types/types';
import { formatPhoneNumber } from '@/utils';
import { phoneRegex } from '@/utils/regex';
import React from 'react';
import {
  useDaumPostcodePopup,
  type Address as DaumAddress,
} from 'react-daum-postcode';
import { SubmitHandler, useForm } from 'react-hook-form';

/** 다음 우편번호 검색 결과를 하나의 주소 문자열로 합친다. */
const buildFullAddress = (data: DaumAddress) => {
  if (data.addressType !== 'R') return data.address;

  const extras = [data.bname, data.buildingName].filter(Boolean).join(', ');

  return extras ? `${data.address} (${extras})` : data.address;
};

const AddressFormModal = ({
  title,
  defaultValues,
  isLoading,
  onSubmit,
  onClose,
}: {
  title: string;
  defaultValues?: AddressFormInput;
  isLoading: boolean;
  onSubmit: SubmitHandler<AddressFormInput>;
  onClose: () => void;
}) => {
  const openPostcodePopup = useDaumPostcodePopup();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressFormInput>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues,
  });

  const handlePostcodeComplete = (data: DaumAddress) => {
    setValue('postCode', data.zonecode, { shouldValidate: true });
    setValue('address', buildFullAddress(data), { shouldValidate: true });
  };

  const handleChangePhoneNumber = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.value.length > 13) return;
    setValue('phoneNumber', formatPhoneNumber(event.target.value), {
      shouldValidate: true,
    });
  };

  return (
    <Modal>
      <Modal.Title closeModal={onClose}>{title}</Modal.Title>
      <Modal.Body>
        <form
          id="address-form"
          className="flex w-full flex-col gap-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <label className="flex w-full flex-col gap-1.5">
            <span className="display text-0.75 tracking-widest text-muted-foreground">
              NAME
            </span>
            <input
              placeholder="받는 분 이름을 입력해주세요"
              {...register('name', {
                required: '이름은 필수입니다!',
              })}
              className="input-field"
            />
            {errors.name && (
              <span className="text-0.875 text-destructive">
                {errors.name.message}
              </span>
            )}
          </label>

          <label className="flex w-full flex-col gap-1.5">
            <span className="display text-0.75 tracking-widest text-muted-foreground">
              PHONE
            </span>
            <input
              type="tel"
              placeholder="휴대폰 번호를 입력해주세요"
              {...register('phoneNumber', {
                required: '휴대폰 번호는 필수입니다!',
                pattern: {
                  value: phoneRegex,
                  message: '휴대폰 번호를 올바르게 입력해주세요!',
                },
              })}
              onChange={handleChangePhoneNumber}
              className="input-field"
            />
            {errors.phoneNumber && (
              <span className="text-0.875 text-destructive">
                {errors.phoneNumber.message}
              </span>
            )}
          </label>

          <div className="flex w-full flex-col gap-1.5">
            <span className="display text-0.75 tracking-widest text-muted-foreground">
              ADDRESS
            </span>
            <div className="flex w-full items-stretch gap-1.5">
              <input
                type="text"
                placeholder="우편번호"
                readOnly
                {...register('postCode', {
                  required: '주소찾기 버튼을 통해 주소를 입력해주세요!',
                })}
                className="input-field flex-auto"
              />
              <Button
                type="button"
                variant="street"
                className="h-auto shrink-0"
                onClick={() =>
                  openPostcodePopup({
                    width: 400,
                    height: 600,
                    onComplete: handlePostcodeComplete,
                  })
                }
              >
                주소찾기
              </Button>
            </div>
            <input
              type="text"
              placeholder="기본 주소"
              readOnly
              {...register('address', {
                required: '주소찾기 버튼을 통해 주소를 입력해주세요!',
              })}
              className="input-field"
            />
            <input
              type="text"
              placeholder="상세 주소"
              {...register('detailAddress')}
              className="input-field"
            />
            {(errors.postCode || errors.address) && (
              <span className="text-0.875 text-destructive">
                {errors.postCode?.message ?? errors.address?.message}
              </span>
            )}
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex gap-3">
          <Button
            variant="street-outline"
            disabled={isLoading}
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            type="submit"
            form="address-form"
            variant="volt"
            disabled={isLoading}
          >
            {isLoading ? <Spinner fill="currentColor" width={20} /> : '저장'}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default AddressFormModal;
