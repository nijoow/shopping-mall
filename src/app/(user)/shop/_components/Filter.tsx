'use client';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

const priceList = [
  { id: 'total', value: '-', label: '전체 가격' },
  { id: '-50000', value: '-50000', label: '5만원 이하' },
  { id: '50000-100000', value: '50000-100000', label: '5~10만원' },
  { id: '100000-200000', value: '100000-200000', label: '10~20만원' },
  { id: '200000-', value: '200000-', label: '20만원 이상' },
];

const colorList = [
  { value: 'BLACK', className: 'bg-black' },
  { value: 'WHITE', className: 'bg-white' },
  { value: 'RED', className: 'bg-red-700' },
  { value: 'BLUE', className: 'bg-blue-700' },
  { value: 'GREEN', className: 'bg-green-700' },
];

const Filter = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedGender = searchParams.get('gender');
  const selectedPrice = searchParams.get('price');
  const selectedColor = searchParams.get('color');

  return (
    <>
      <span className="font-semibold">성별</span>
      <div className="flex gap-2">
        <Badge
          variant={!selectedGender ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() =>
            router.replace(
              `?gender=&price=${selectedPrice}&color=${selectedColor}`,
              { scroll: false },
            )
          }
        >
          전체
        </Badge>
        <Badge
          variant={selectedGender === 'MALE' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() =>
            router.replace(
              `?gender=MALE&price=${selectedPrice}&color=${selectedColor}`,
              { scroll: false },
            )
          }
        >
          남성
        </Badge>
        <Badge
          variant={selectedGender === 'FEMALE' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() =>
            router.replace(
              `?gender=FEMALE&price=${selectedPrice}&color=${selectedColor}`,
              { scroll: false },
            )
          }
        >
          여성
        </Badge>
      </div>
      <Separator className="my-2" />
      <span className="font-semibold">가격</span>
      <RadioGroup
        defaultValue="-"
        onValueChange={value =>
          router.replace(
            `?gender=${selectedGender}&price=${value}&color=${selectedColor}`,
            { scroll: false },
          )
        }
      >
        {priceList.map(({ value, id, label }) => (
          <div key={id} className="flex items-center space-x-2">
            <RadioGroupItem value={value} id={id} />
            <Label htmlFor={id}>{label}</Label>
          </div>
        ))}
      </RadioGroup>
      <Separator className="my-2" />
      <span className="font-semibold">색상</span>
      <div className="flex flex-wrap items-center gap-6">
        {colorList.map(({ value, className }) => (
          <button
            key={value}
            type="button"
            className={cn(
              `col-span-1 grid h-7 w-7 rounded-sm`,
              {
                'border-2': value === 'white',
              },
              className,
            )}
            onClick={() =>
              router.replace(
                `?gender=${selectedGender}&price=${selectedPrice}&color=${value}`,
                { scroll: false },
              )
            }
          />
        ))}
      </div>
    </>
  );
};

export default Filter;
