import { cn } from '@/lib/utils/cn';
import React, { HTMLAttributes } from 'react';

const Button = ({
  children,
  type = 'contained',
  className,
  ...rest
}: HTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
  type?: 'outlined' | 'contained';
}) => {
  return (
    <button
      className={cn(
        'rounded-md px-8 py-1 border-2 font-medium drop-shadow-sm',
        {
          'border-gray-200 text-gray-500': type === 'outlined',
          'border-black text-white bg-black': type === 'contained',
        },
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
