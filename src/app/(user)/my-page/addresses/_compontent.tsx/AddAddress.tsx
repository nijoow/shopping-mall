'use client';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import React, { useState } from 'react';
import { IoAdd } from 'react-icons/io5';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { phoneRegex } from '@/lib/utils/regex';
import { useDaumPostcodePopup } from 'react-daum-postcode';

const addressFormSchema = z.object({
  name: z.string().nullable(),
  gender: z.enum(['MALE', 'FEMALE']).nullable(),
  birth: z
    .object({ year: z.number(), month: z.number(), day: z.number() })
    .nullable(),
  phone_number: z.string().regex(phoneRegex).nullable(),
});

const AddAddress = () => {
  const open = useDaumPostcodePopup();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [address, setAddress] = useState<Record<string, string | null>>({
    postCode: null,
    address: null,
    detailAddress: null,
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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

    setAddress({
      postCode: data.zonecode,
      address: fullAddress,
      detailAddress: '',
    });
  };
  return (
    <>
      <div
        className="grid space-x-4 grid-cols-2 cursor-pointer"
        onClick={openModal}
      >
        <div className="bg-white justify-between col-span-1 rounded-lg p-4 w-full h-52 flex flex-col border border-gray-300">
          <span>새 배송지</span>
          <IoAdd size={24} />
        </div>
      </div>
      {isModalOpen && (
        <Modal>
          <Modal.Title closeModal={closeModal}>배송지 추가</Modal.Title>
          <Modal.Body>
            <form className="flex flex-col gap-4 w-full my-4 ">
              <label className="flex flex-col gap-1 w-full">
                <div className="w-full flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="우편번호"
                    value={address.postCode ?? ''}
                    disabled
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
                  value={address.address ?? ''}
                  disabled
                  className="px-3 py-2.5 rounded-md text-1 border border-gray-300 flex-auto"
                />
                <input
                  type="text"
                  placeholder="상세 주소"
                  value={address.detailAddress ?? ''}
                  onChange={e =>
                    setAddress({ ...address, detailAddress: e.target.value })
                  }
                  className="px-3 py-2.5 rounded-md text-1 border border-gray-300 flex-auto"
                />
              </label>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3 mt-6">
              <Button variant="outlined" onClick={closeModal}>
                취소
              </Button>
              <Button>저장</Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default AddAddress;
