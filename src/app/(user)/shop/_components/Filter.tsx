import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import React from 'react';

const Filter = () => {
  return (
    <>
      <span className="font-semibold">성별</span>
      <div className="flex gap-2">
        <Badge variant="outline">남성</Badge>
        <Badge variant="outline">여성</Badge>
      </div>
      <span className="font-semibold">가격</span>
      <span className="font-semibold">색상</span>
      <div className="flex flex-wrap items-center gap-6">
        {[
          'bg-black',
          'bg-white',
          'bg-red-700',
          'bg-blue-700',
          'bg-green-700',
        ].map(color => (
          <div
            key={color}
            className={cn(
              `col-span-1 grid h-7 w-7 rounded-sm`,
              {
                'border-2': color === 'bg-white',
              },
              color,
            )}
          />
        ))}
      </div>
    </>
  );
};

export default Filter;
