import { cn } from '@/lib/utils';
import React, { ButtonHTMLAttributes } from 'react';

const Button = ({
  children,
  variant = 'contained',
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
  variant?: 'outlined' | 'contained';
}) => (
  <button
    type="button"
    className={cn(
      'rounded-md border-2 px-8 py-1 font-medium drop-shadow-sm',
      {
        'border-gray-200 text-gray-500': variant === 'outlined',
        'border-black bg-black text-white': variant === 'contained',
      },
      className,
    )}
    {...rest}
  >
    {children}
  </button>
);

export default Button;
