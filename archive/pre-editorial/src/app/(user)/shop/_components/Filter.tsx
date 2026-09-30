'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { IoClose } from 'react-icons/io5';

const genderList = [
  { value: null, label: '전체' },
  { value: 'MALE', label: '남성' },
  { value: 'FEMALE', label: '여성' },
];

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

const FilterSection = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-2.5 border-b border-border pb-5">
    <span className="eyebrow">{label}</span>
    {children}
  </div>
);

const Filter = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedGender = searchParams.get('gender');
  const selectedPrice = searchParams.get('price') ?? '-';
  const selectedColor = searchParams.get('color');

  const hasActiveFilter = Boolean(
    selectedGender || selectedPrice !== '-' || selectedColor,
  );

  /** 값이 없으면 파라미터를 제거해 URL을 깨끗하게 유지한다 */
  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set(key, value);
    else params.delete(key);

    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const resetFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    ['gender', 'price', 'color'].forEach(key => params.delete(key));
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <FilterSection label="GENDER">
        <div className="flex flex-wrap gap-1.5">
          {genderList.map(({ value, label }) => (
            <button
              key={label}
              type="button"
              className={cn(
                'border px-3 py-1 text-0.75 transition-colors',
                selectedGender === value
                  ? 'border-volt bg-volt font-bold text-ink'
                  : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
              )}
              onClick={() => updateParam('gender', value)}
            >
              {label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection label="PRICE">
        <RadioGroup
          value={selectedPrice}
          onValueChange={value =>
            updateParam('price', value === '-' ? null : value)
          }
        >
          {priceList.map(({ value, id, label }) => (
            <div key={id} className="flex items-center space-x-2">
              <RadioGroupItem value={value} id={id} />
              <Label
                htmlFor={id}
                className={cn(
                  'cursor-pointer font-normal',
                  selectedPrice === value
                    ? 'text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </FilterSection>

      <FilterSection label="COLOR">
        <div className="flex flex-wrap items-center gap-3">
          {colorList.map(({ value, className }) => {
            const isSelected = selectedColor === value;

            return (
              <button
                key={value}
                type="button"
                className={cn(
                  'h-7 w-7 border transition-all',
                  isSelected
                    ? 'scale-110 border-volt shadow-street-sm'
                    : 'border-input hover:scale-110',
                  className,
                )}
                onClick={() => updateParam('color', isSelected ? null : value)}
                aria-label={`${value} 색상 필터`}
                aria-pressed={isSelected}
              />
            );
          })}
        </div>
      </FilterSection>

      {hasActiveFilter && (
        <button
          type="button"
          onClick={resetFilters}
          className="flex w-fit items-center gap-1 text-0.75 text-muted-foreground transition-colors hover:text-volt"
        >
          <IoClose size={14} />
          필터 초기화
        </button>
      )}
    </>
  );
};

export default Filter;
