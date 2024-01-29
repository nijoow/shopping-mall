import { cn } from '@/lib/utils/cn';
import React, { ButtonHTMLAttributes, HTMLAttributes } from 'react';

const Button = ({
  children,
  variant = 'contained',
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
  variant?: 'outlined' | 'contained';
}) => {
  return (
    <button
      className={cn(
        'rounded-md px-8 py-1 border-2 font-medium drop-shadow-sm',
        {
          'border-gray-200 text-gray-500': variant === 'outlined',
          'border-black text-white bg-black': variant === 'contained',
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
